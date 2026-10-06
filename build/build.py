# -*- coding: utf-8 -*-
"""
さかさま不動産の掲載者ページ（build/fetch.sh で取得済み）から、
占いアプリのデータ data.js と写真 img/*.webp を作る。

  usage: python3 build/build.py [作業ディレクトリ]    既定: build/_work
"""
import sys, os, re, json, html, glob, unicodedata
from collections import Counter
try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit('Pillow が要る:  pip3 install Pillow')

HERE = os.path.dirname(os.path.abspath(__file__))
MUNI = json.load(open(os.path.join(HERE, 'muni.json'), encoding='utf-8'))
PREF_CITIES = MUNI['pref']      # 都道府県 -> 市区町村のリスト（総務省の全国地方公共団体コード）
WARD_PARENT = MUNI['ward']      # 政令市の区 -> 親の市

WORK = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '_work')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = lambda *a: os.path.join(WORK, *a)
R = lambda *a: os.path.join(ROOT, *a)

print('■ 1. 個別ページを構造化する')

def clean(x):
    x = re.sub(r'<br\s*/?>', '\n', x)
    x = re.sub(r'</p>', '\n', x)
    x = re.sub(r'<[^>]+>', '', x)
    x = html.unescape(x)
    x = re.sub(r'[ \t　]+', ' ', x)
    x = re.sub(r'\n{3,}', '\n\n', x)
    return x.strip()

lst = {d['slug']: d for d in json.load(open(W('list.json'), encoding='utf-8'))}
out = []
for f in sorted(glob.glob(W('pages', '*.html'))):
    slug = os.path.basename(f)[:-5]
    s = open(f, encoding='utf-8').read()
    main = re.search(r'<main class="p_lesseeSingle">(.*?)</main>', s, re.S)
    if not main:
        print('NO MAIN', slug); continue
    m = main.group(1)
    g = lambda p: (re.search(p, m, re.S).group(1) if re.search(p, m, re.S) else '')
    rec = {'slug': slug}
    rec['title'] = clean(g(r'p_lesseeSingleHeader_title">(.*?)</h1>'))
    rec['roll'] = clean(g(r'p_lesseeSingleHeaderText_roll">(.*?)</p>'))
    rec['name'] = clean(g(r'p_lesseeSingleHeaderText_name">(.*?)</h2>'))
    rec['profile'] = clean(g(r'p_lesseeSingleHeaderText_profile">(.*?)</p>'))
    rec['date'] = g(r'<time datetime="([\d-]+)"')
    rec['image'] = g(r'p_lesseeSingleHeader_image">\s*<img[^>]*?src="([^"]+)"')
    # 地域タクソノミ
    areas = []
    for blk in re.findall(r'<div class="p_lesseeSingleAreaList">(.*?)</div>', m, re.S):
        pref = clean(re.search(r'_heading">(.*?)</h4>', blk, re.S).group(1)) if re.search(r'_heading">(.*?)</h4>', blk, re.S) else ''
        cities = [clean(c) for c in re.findall(r'<li>(.*?)</li>', blk, re.S)]
        areas.append({'pref': pref, 'cities': cities})
    rec['areaTax'] = areas
    # 本文セクション
    secs = {}
    order = []
    for h, b in re.findall(r'<div class="p_lesseeSingle_content">\s*<h2>(.*?)</h2>(.*?)</div>', m, re.S):
        k = clean(h); secs[k] = clean(b); order.append(k)
    rec['sections'] = secs
    # プロフィール欄（h3構成）
    prof = re.search(r'p_lesseeSinglePlofile(.*?)(?:</article>|p_lesseeSingle_button)', m, re.S)
    psec = {}
    if prof:
        pm = prof.group(1)
        parts = re.split(r'<h3>(.*?)</h3>', pm, flags=re.S)
        for i in range(1, len(parts), 2):
            psec[clean(parts[i])] = clean(parts[i+1])
    rec['profileSections'] = psec
    base = lst.get(slug, {})
    rec['listAreas'] = base.get('areas', [])
    rec['status'] = base.get('status', '')
    out.append(rec)

json.dump(out, open(W('detail.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('parsed', len(out))
c = Counter()
for r in out: c.update(r['sections'].keys())
print(c.most_common(20))
print('no areaTax:', sum(1 for r in out if not r['areaTax']))
print('no basic:', sum(1 for r in out if not any('基本情報' in k or '物件' in k for k in r['sections'])))

print('■ 2. 条件を読み取る')

D = json.load(open(W('detail.json'), encoding='utf-8'))

PREFS = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県']
PREF_SHORT = {p: p.rstrip('県都府道') for p in PREFS}

def nfkc(s): return unicodedata.normalize('NFKC', s or '')

def kv(block):
    out = {}
    cur = None
    for line in block.split('\n'):
        m = re.match(r'^\s*([^:：;；]{1,16})\s*[:：;；]\s*(.*)$', line)
        if m:
            cur = m.group(1).strip(); out[cur] = m.group(2).strip()
        elif cur and line.strip():
            out[cur] += ' ' + line.strip()
    return out

def pick(d, *tests):
    vals = []
    for k, v in d.items():
        for t in tests:
            if t(k): vals.append(v); break
    return ' / '.join(vals)

MAN = 10000
def parse_money(t):
    """return (maxYen|None, flexible:bool, none:bool)"""
    if not t: return None, False, False
    s = nfkc(t).replace(',', '')
    if re.search(r'(考えていない|予定はない|考えておりません|希望しない|なし|ありません|不要)', s) and not re.search(r'\d', s):
        return None, False, True
    flexible = bool(re.search(r'(要相談|応相談|相談|問いません|検討|条件次第|未定|わからない)', s))
    cands = []
    # X万 patterns
    for m in re.finditer(r'(\d+(?:\.\d+)?)\s*万', s):
        cands.append(float(m.group(1)) * MAN)
    if not cands:
        for m in re.finditer(r'(\d{4,})\s*円', s):
            cands.append(float(m.group(1)))
    if not cands:
        return None, flexible, False
    mx = max(cands)
    # 「前後/程度/くらい」は少し上まで許容
    if re.search(r'(前後|程度|くらい|ほど|位)', s):
        mx = mx * 1.2
    return int(mx), flexible, False

def parse_size(t):
    """return (min, max) in sqm"""
    if not t: return None, None
    s = nfkc(t)
    nums = [float(x) for x in re.findall(r'(\d+(?:\.\d+)?)\s*(?:平米|平方メートル|㎡|m2|m²)', s)]
    if not nums:
        jo = [float(x) for x in re.findall(r'(\d+(?:\.\d+)?)\s*畳', s)]
        if jo: nums = [j * 1.62 for j in jo]
    if not nums:
        ldk = re.search(r'(\d)\s*[SLDK]{1,3}', s)
        if ldk: nums = [float(ldk.group(1)) * 20 + 15]
    if not nums: return None, None
    lo, hi = min(nums), max(nums)
    if len(nums) == 1:
        if re.search(r'(以上|から|〜以上|超)', s): return lo, None
        if re.search(r'(以下|未満|まで)', s): return None, lo
        return lo * 0.7, lo * 1.5
    return lo, hi

USE_TAGS = {
  'cafe':    ('カフェ・喫茶', r'カフェ|喫茶|コーヒー|珈琲|焙煎|ティー|茶房'),
  'food':    ('飲食店', r'飲食|食堂|レストラン|居酒屋|バル|バー|ビストロ|ラーメン|そば|蕎麦|うどん|寿司|焼き|お菓子|菓子|スイーツ|パン|ベーカリー|弁当|惣菜|キッチン|厨房|料理|定食|カレー|ケーキ|ジェラート|アイス|酒|醸造|ブルワリー|パティスリー'),
  'shop':    ('物販・お店', r'物販|雑貨|古着|アパレル|セレクトショップ|販売|小売|花屋|生花|八百屋|精肉|青果|商店|ショップ|マルシェ|市場'),
  'book':    ('本・図書', r'本屋|書店|古本|図書|ブックカフェ|文庫|絵本'),
  'stay':    ('宿泊・ゲストハウス', r'ゲストハウス|宿泊|民泊|ホステル|旅館|ホテル|宿|キャンプ|サウナ'),
  'live':    ('住む・暮らす', r'住みたい|住む|暮らし|住居|住まい|移住|シェアハウス|二拠点|多拠点|住宅|同居|定住'),
  'kids':    ('子ども・学び場', r'子ども|こども|子供|駄菓子|学童|保育|幼児|園児|小学生|中学生|高校生|不登校|フリースクール|親子|ママ|赤ちゃん|児童|放課後'),
  'care':    ('福祉・ケア', r'障害|障がい|福祉|グループホーム|就労|介護|看護|ケア|デイサービス|高齢者|認知症|自立支援|相談支援|引きこもり|ひきこもり|生きづらさ'),
  'school':  ('教室・スクール', r'教室|塾|スクール|ワークショップ|講座|習い事|レッスン|稽古|学び舎|アカデミー|英会話|研修'),
  'atelier': ('工房・アトリエ', r'工房|アトリエ|制作|作家|陶芸|木工|縫製|裁縫|ものづくり|手仕事|鍛冶|ガラス|革|染め|織り|クラフト|スタジオ|撮影'),
  'community':('居場所・コミュニティ', r'コミュニティ|交流|居場所|つながり|サードプレイス|寄り合い|たまり場|交流拠点|集い|みんなの|公民館|語り合|地域の拠点'),
  'farm':    ('農・自然', r'農業|農園|畑|田んぼ|家庭菜園|就農|養蜂|林業|里山|自然体験|ガーデン|庭づくり'),
  'beauty':  ('美容・からだ', r'美容|サロン|整体|マッサージ|ネイル|エステ|鍼灸|セラピー|ヨガ|ピラティス|治療院|カイロ|リラクゼーション|理容|美容室|トリミング'),
  'art':     ('アート・文化', r'ギャラリー|展示|アート|美術|音楽|ライブ|映画|シアター|劇場|演劇|ダンス|写真|デザイン|アーティスト|美術館|博物館'),
  'sports':  ('スポーツ・運動', r'ジム|スポーツ|武術|トレーニング|体操|格闘|フィットネス|卓球|ボルダリング|太極拳|柔道|空手|サーフ|ランニング'),
  'office':  ('仕事場・オフィス', r'オフィス|コワーキング|事務所|事業所|シェアオフィス|仕事場|作業場|レンタルスペース|貸しスペース'),
  'pets':    ('動物', r'犬|猫|ペット|動物|保護猫|保護犬|トリミング|馬|鶏|ヤギ'),
}

BLDG_TAGS = {
  'kominka': ('古民家・空き家', r'古民家|空き家|空家|空き店舗|昭和|築古|町家|長屋|蔵|納屋|古い家|古家'),
  'house':   ('一軒家・戸建', r'一軒家|戸建|一戸建|平屋|住宅'),
  'tenant':  ('店舗・テナント', r'テナント|店舗|路面|商店街|スケルトン|居抜き'),
  'warehouse':('倉庫・工場', r'倉庫|工場|作業場|ガレージ|格納庫|プレハブ'),
  'apart':   ('マンション・アパート', r'マンション|アパート|ビル|一室|区分'),
  'land':    ('土地・空き地', r'土地|空き地|更地|敷地だけ|畑|農地'),
}

def tagmatch(text, table):
    hits = []
    for key, (label, pat) in table.items():
        if re.search(pat, text):
            hits.append(key)
    return hits

out = []
for r in D:
    b = r['sections']['希望物件の基本情報']
    k = kv(b)
    area_t = pick(k, lambda x: 'エリア' in x or '地域' in x or '場所' in x)
    size_t = pick(k, lambda x: '広さ' in x or '面積' in x)
    rent_t = pick(k, lambda x: ('賃' in x or '家賃' in x or x in ('金額', '賃料')) and '購入' not in x)
    buy_t  = pick(k, lambda x: '購入' in x or '売買' in x)
    type_t = pick(k, lambda x: '種類' in x or '用途' in x or '目的' in x or x == '種別')
    other_t= pick(k, lambda x: 'その他' in x or '条件' in x or '希望' == x)
    if not other_t and not k:
        other_t = b

    rentMax, rentFlex, rentNone = parse_money(rent_t)
    buyMax, buyFlex, buyNone = parse_money(buy_t)
    sMin, sMax = parse_size(size_t)

    prefs, cities = [], []
    for a in r['areaTax']:
        if a['pref']: prefs.append(a['pref'])
        cities += a['cities']
    blob_area = area_t + ' ' + ' '.join(r['listAreas']) + ' ' + ' '.join(cities)
    for p in PREFS:
        if p in blob_area or (PREF_SHORT[p] in blob_area and len(PREF_SHORT[p]) >= 2):
            if p not in prefs: prefs.append(p)

    # 都道府県ごとに、本文へ実際に出てくる市区町村だけを拾う
    by_pref = {}
    for p in prefs:
        here = PREF_CITIES.get(p)
        if not here:
            continue
        hit = set()
        for c in here:
            if c in blob_area:
                hit.add(c)
        # 「名古屋市中村区」のような政令市の区は、親の市に寄せる
        for ward, parent in WARD_PARENT.items():
            if '市' in ward and ward in blob_area and parent in here:
                hit.add(parent)
        if hit:
            by_pref[p] = sorted(hit)
    cities = by_pref

    full = ' '.join([r['title'], r['roll'], r['profile'],
                     r['sections'].get('やりたいこと', ''), r['sections'].get('やりたい理由', ''),
                     b, ' '.join(r['profileSections'].values())])
    short = ' '.join([r['title'], r['roll'], r['sections'].get('やりたいこと', ''), r['sections'].get('やりたい理由', '')])

    uses = tagmatch(short, USE_TAGS)
    if not uses: uses = tagmatch(full, USE_TAGS)
    bldg = tagmatch(area_t + ' ' + type_t + ' ' + other_t + ' ' + short, BLDG_TAGS)

    renov = bool(re.search(r'DIY|ＤＩＹ|リノベ|リフォーム|改装|改修|セルフビルド|手を加え|自分たちで直|好きにいじ', full))
    renov_no = bool(re.search(r'(改装|リノベ|DIY)(は)?(不要|しない|考えていない)|そのまま使える|現状のまま', full))
    fire = 'cafe' in uses or 'food' in uses or bool(re.search(r'厨房|火|コンロ|ガス|調理|営業許可|飲食店営業', full))
    lively = bool(re.search(r'イベント|ライブ|音楽|人が集ま|賑わ|にぎわ|ダンス|workshop|ワークショップ|子ども|こども|交流', full))
    quiet = bool(re.search(r'静か|静穏|音は出|騒音|落ち着いた', full))
    parking = bool(re.search(r'駐車場|車が停め|駐車スペース', full))

    out.append({
        'slug': r['slug'], 'name': r['name'], 'roll': r['roll'], 'title': r['title'],
        'status': r['status'],
        'profile': r['profile'], 'image': r['image'], 'date': r['date'],
        'url': 'https://sakasama-fudosan.com/lessee/%s/' % r['slug'],
        'want': r['sections'].get('やりたいこと', ''),
        'why': r['sections'].get('やりたい理由', ''),
        'basicRaw': b,
        'areaText': area_t, 'sizeText': size_t, 'rentText': rent_t, 'buyText': buy_t,
        'typeText': type_t, 'otherText': other_t,
        'prefs': prefs, 'cities': cities,
        'rentMax': rentMax, 'rentFlex': rentFlex, 'rentNone': rentNone,
        'buyMax': buyMax, 'buyFlex': buyFlex, 'buyNone': buyNone,
        'sizeMin': sMin, 'sizeMax': sMax,
        'uses': uses, 'bldg': bldg,
        'renov': renov, 'renovNo': renov_no, 'fire': fire,
        'lively': lively, 'quiet': quiet, 'parking': parking,
    })

json.dump(out, open(W('features.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('n =', len(out))
print('no pref:', sum(1 for x in out if not x['prefs']))
print('no rent:', sum(1 for x in out if x['rentMax'] is None and not x['rentFlex'] and not x['rentNone']))
print('no size:', sum(1 for x in out if x['sizeMin'] is None and x['sizeMax'] is None))
print('no uses:', sum(1 for x in out if not x['uses']))
print('no bldg:', sum(1 for x in out if not x['bldg']))
c = Counter()
for x in out: c.update(x['uses'])
print(c.most_common())
c2 = Counter()
for x in out: c2.update(x['prefs'])
print(c2.most_common(12))

print('■ 3. data.js を書き出す')


F = json.load(open(W('features.json'), encoding='utf-8'))

def safe_name(slug, used):
    n = re.sub(r'[^A-Za-z0-9_-]', '_', slug)[:60] or 'lessee'
    base, i = n, 2
    while n in used:
        n = base + '-' + str(i); i += 1
    used.add(n)
    return n

used_names = set()
out = []
OPEN = '募集中'
for x in F:
    if '保護中' in x['title']:
        continue
    if not os.path.exists(W('img', x['slug'] + '.src')):
        print('NO IMG', x['slug'])
    # 賃料の異常値（購入額の誤記入）を相談扱いに
    rentMax, rentFlex = x['rentMax'], x['rentFlex']
    if rentMax and rentMax > 1000000:
        rentMax, rentFlex = None, True
    rec = {
        's': x['slug'], 'i': safe_name(x['slug'], used_names),
        'st': 'open' if x['status'] == OPEN else 'done',
        'stl': '' if x['status'] == OPEN else x['status'],
        'url': 'https://sakasama-fudosan.com/lessee/' + x['slug'] + '/',
        'n': x['name'], 'r': x['roll'], 't': x['title'],
        'w': x['want'],
        'a': x['areaText'] or '／'.join(cities), 'sz': x['sizeText'],
        'rt': x['rentText'], 'ot': x['otherText'],
        'pr': x['prefs'], 'ct': x['cities'],
        'rm': rentMax, 'rf': rentFlex or x['rentNone'],
        'bm': x['buyMax'], 'bf': x['buyFlex'], 'bn': x['buyNone'],
        'smin': round(x['sizeMin']) if x['sizeMin'] else None,
        'smax': round(x['sizeMax']) if x['sizeMax'] else None,
        'u': x['uses'], 'b': x['bldg'],
        'f': [k for k, v in [('renov', x['renov']), ('fire', x['fire']), ('lively', x['lively']),
                              ('quiet', x['quiet']), ('parking', x['parking'])] if v],
    }
    # やりたいことが空の人だけ、プロフィールで代える
    if not rec['w']:
        rec['w'] = x['profile']
    out.append(rec)

pass
js = '\ufeff' + 'window.LESSEES=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';'
open(R('data.js'), 'w', encoding='utf-8').write(js)
print('records', len(out), 'data.js KB', round(len(js.encode())/1024))
c = Counter()
for x in out: c.update(x['pr'])
print(len(c), 'prefs covered')
print(c.most_common(50))

print('■ 4. 写真をスプライトシートにまとめる')
TILE_W, TILE_H, COLS, ROWS = 512, 384, 6, 6
PER = COLS * ROWS
os.makedirs(R('img'), exist_ok=True)

sheets, total = 0, 0
for start in range(0, len(out), PER):
    chunk = out[start:start + PER]
    n_rows = (len(chunk) + COLS - 1) // COLS
    path0 = R('img', 'sheet-%d.webp' % sheets)
    newest0 = max([os.path.getmtime(W('img', r['s'] + '.src'))
                   for r in chunk if os.path.exists(W('img', r['s'] + '.src'))] or [0])
    fresh = os.path.exists(path0) and os.path.getmtime(path0) >= newest0
    sheet = Image.new('RGB', (TILE_W * COLS, TILE_H * n_rows), (239, 232, 216))
    for k, rec in enumerate(chunk):
        col, row = k % COLS, k // COLS
        rec['sp'], rec['sc'], rec['sr'] = sheets, col, row
        srcf = W('img', rec['s'] + '.src')
        if not os.path.exists(srcf):
            print('   写真なし:', rec['s']); continue
        if fresh:
            continue
        try:
            im = Image.open(srcf)
            im = ImageOps.exif_transpose(im).convert('RGB')
            im = ImageOps.fit(im, (TILE_W, TILE_H), Image.LANCZOS, centering=(0.5, 0.42))
            sheet.paste(im, (col * TILE_W, row * TILE_H))
        except Exception as e:
            print('   変換できず:', rec['s'], e)
    # シートごとの実際の行数も持たせる（切り出し位置の計算に要る）
    for rec in chunk:
        rec['sn'] = n_rows
    path = R('img', 'sheet-%d.webp' % sheets)
    newest = max([os.path.getmtime(W('img', r['s'] + '.src'))
                  for r in chunk if os.path.exists(W('img', r['s'] + '.src'))] or [0])
    if not (os.path.exists(path) and os.path.getmtime(path) >= newest):
        sheet.save(path, 'WEBP', quality=68, method=5)
    total += os.path.getsize(path)
    sheets += 1

for f in os.listdir(R('img')):
    if f.endswith('.webp') and not f.startswith('sheet-'):
        os.remove(R('img', f))

# スプライト位置が入ったので data.js を書き直す
js = ('\ufeff' + 'window.SHEET_COLS=' + str(COLS) + ';window.LESSEES='
      + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';')
open(R('data.js'), 'w', encoding='utf-8').write(js)

# 都道府県 -> 全市区町村（総務省のコード表そのまま）を画面に渡す
mj = '\ufeff' + 'window.MUNI=' + json.dumps(PREF_CITIES, ensure_ascii=False, separators=(',', ':')) + ';'
open(R('muni.js'), 'w', encoding='utf-8').write(mj)
print('   muni.js %d KB / %d都道府県' % (len(mj.encode()) / 1024, len(PREF_CITIES)))

print('   シート %d枚 / 合計 %.1f MB' % (sheets, total / 1048576))
print('   data.js %d KB / %d人（募集中 %d）' % (
    len(js.encode()) / 1024, len(out), sum(1 for x in out if x['st'] == 'open')))
print('✔ できあがり。index.html をブラウザで開いて確かめてくれ。')

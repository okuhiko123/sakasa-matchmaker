#!/bin/zsh
# さかさま不動産の掲載者ページを取ってくる。
#   usage: ./build/fetch.sh [作業ディレクトリ]   既定: build/_work
set -e
WORK="${1:-build/_work}"
mkdir -p "$WORK/pages"
cd "$WORK"

echo "▶ 掲載者一覧を取得"
curl -s "https://sakasama-fudosan.com/lessee/" -o list.html
echo "  $(grep -c 'c_lesseeList_item' list.html) 件のカード"

echo "▶ 掲載者全員の個別ページを取得（並列8）"
python3 - <<'PY'
import re, html, json
s = open('list.html', encoding='utf-8').read()
body = s[s.find('<div class="c_lesseeList">'):]
items = re.split(r'<div class="c_lesseeList_item ', body)[1:]
cl = lambda x: html.unescape(re.sub(r'<[^>]+>', '', x or '')).strip()
out = []
for it in items:
    m = re.search(r'href="https://sakasama-fudosan\.com/lessee/([^/"]+)/"', it)
    if not m: continue
    g = lambda p: (re.search(p, it, re.S).group(1) if re.search(p, it, re.S) else '')
    out.append({
        'slug': m.group(1),
        'name': cl(g(r'c_lesseeListText_name">(.*?)</span>')),
        'roll': cl(g(r'c_lesseeListText_roll">(.*?)</span>')),
        'title': cl(g(r'c_lesseeList_title">(.*?)</p>')),
        'image': g(r'c_lesseeList_image">\s*<img[^>]*?src="([^"]+)"'),
        'areas': [cl(a) for a in re.findall(r'c_lesseeListTextArea_item">(.*?)</li>', it, re.S)],
        'status': cl(g(r'_matchingOther">(.*?)</span>')) or '募集中',
    })
json.dump(out, open('list.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open('slugs.txt', 'w').write('\n'.join(x['slug'] for x in out))
print('  募集中', sum(1 for x in out if x['status'] == '募集中'), '/ 全', len(out), '（全員とる）')
PY

cat > _dl.sh <<'SH'
#!/bin/zsh
[ -s "pages/$1.html" ] || curl -s --max-time 60 -o "pages/$1.html" "https://sakasama-fudosan.com/lessee/$1/"
SH
chmod +x _dl.sh
cat slugs.txt | xargs -P 8 -n 1 ./_dl.sh
echo "  個別ページ $(ls pages | wc -l) 件"

echo "▶ 写真を取得（並列8）"
mkdir -p img
python3 - <<'PY'
import json
d = json.load(open('list.json', encoding='utf-8'))
with open('imglist.txt', 'w') as f:
    for x in d:
        if x['image']:
            f.write(x['slug'] + '\n' + x['image'] + '\n')
PY
cat > _dlimg.sh <<'SH'
#!/bin/zsh
[ -s "img/$1.src" ] || curl -sL --max-time 90 -o "img/$1.src" "$2"
SH
chmod +x _dlimg.sh
cat imglist.txt | xargs -P 8 -n 2 ./_dlimg.sh
echo "  写真 $(ls img | wc -l) 件"
echo "✔ 取得おわり。つぎは python3 build/build.py $WORK"

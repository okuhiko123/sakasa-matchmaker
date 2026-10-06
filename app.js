/* さかさマッチメーカー ----------------------------------------------------
   物件を持っている人が質問に答えると、さかさま不動産の掲載者のなかから
   相性のよい人を占い師・奥田が占って紹介する。
   データ: data.js (window.LESSEES) ＝ 掲載者一覧と個別ページから抽出
------------------------------------------------------------------------- */
(function () {
'use strict';

var P = window.LESSEES || [];
var OPEN = P.filter(function (x) { return x.st === 'open'; });
var DONE = P.filter(function (x) { return x.st !== 'open'; });
var $ = function (id) { return document.getElementById(id); };
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ====================================================================
   1. 奥田（キャラクター）
==================================================================== */

var GENIE = [
'<g id="gBody" style="transform-box:fill-box;transform-origin:50% 92%">',

// ---- 足もとは煙。ランプから立ちのぼって人の形になる ----
'<path d="M96 216 C72 226 78 246 94 250 C70 258 74 280 94 284 C76 296 84 314 104 314 C112 330 134 336 140 344 C146 336 168 330 176 314 C196 314 204 296 186 284 C206 280 210 258 186 250 C202 246 208 226 184 216 Z" fill="#cbe7f4" opacity=".85"/>',
'<path d="M104 232 C88 238 92 250 106 252" fill="none" stroke="#9fd0e8" stroke-width="3" stroke-linecap="round"/>',
'<path d="M176 262 C192 266 190 280 176 284" fill="none" stroke="#9fd0e8" stroke-width="3" stroke-linecap="round"/>',
'<path d="M124 258 C112 276 132 284 122 300" fill="none" stroke="#8cc5e0" stroke-width="2.6" stroke-linecap="round"/>',
'<path d="M158 268 C168 282 150 290 158 304" fill="none" stroke="#8cc5e0" stroke-width="2.6" stroke-linecap="round"/>',

// ---- 後ろ髪（うねって肩下まで） ----
'<path d="M140 30 C76 30 44 78 50 140 C52 158 44 172 50 190 C56 180 62 176 70 174 C62 184 58 196 62 208 C72 198 80 194 88 192 C78 200 74 208 78 218 C92 206 100 196 103 180 C88 148 90 100 106 80 C123 56 157 56 174 80 C190 100 192 148 177 180 C180 196 188 206 202 218 C206 208 202 200 192 192 C200 194 208 198 218 208 C222 196 218 184 210 174 C218 176 224 180 230 190 C236 172 228 158 230 140 C236 78 204 30 140 30 Z" fill="#241f1c"/>',

// ---- 胴（黒T） ----
'<path d="M140 186 C102 186 76 206 70 238 C98 252 182 252 210 238 C204 206 178 186 140 186 Z" fill="#3b3531"/>',
'<path d="M140 186 C102 186 76 206 70 238 C98 252 182 252 210 238 C204 206 178 186 140 186 Z" fill="none" stroke="#241f1c" stroke-width="3.4" stroke-linejoin="round"/>',
'<path d="M120 189 C127 201 153 201 160 189" fill="none" stroke="#241f1c" stroke-width="3.2" stroke-linecap="round"/>',

// ---- 腕組み ----
'<g id="gArms">',
  '<path d="M82 222 C98 252 182 252 198 222 C208 244 186 266 140 266 C94 266 72 244 82 222 Z" fill="#524b45"/>',
  '<path d="M82 222 C98 252 182 252 198 222 C208 244 186 266 140 266 C94 266 72 244 82 222 Z" fill="none" stroke="#241f1c" stroke-width="3.2" stroke-linejoin="round"/>',
  '<ellipse cx="116" cy="245" rx="15" ry="10" fill="#f7cdb4" stroke="#241f1c" stroke-width="3" transform="rotate(-9 116 245)"/>',
  '<ellipse cx="164" cy="236" rx="15" ry="10" fill="#f9d6bf" stroke="#241f1c" stroke-width="3" transform="rotate(9 164 236)"/>',
'</g>',

// ---- 首・耳・顔 ----
'<path d="M126 156 L154 156 L154 192 L126 192 Z" fill="#e8b394" stroke="#241f1c" stroke-width="3" stroke-linejoin="round"/>',
'<ellipse cx="86" cy="126" rx="9" ry="13" fill="#f7cdb4" stroke="#241f1c" stroke-width="3"/>',
'<ellipse cx="194" cy="126" rx="9" ry="13" fill="#f7cdb4" stroke="#241f1c" stroke-width="3"/>',
'<ellipse cx="140" cy="120" rx="53" ry="57" fill="#f7cdb4" stroke="#241f1c" stroke-width="3.4"/>',

// ---- 前髪（中央が割れて左右へ流れる） ----
'<path d="M140 44 C103 44 80 70 79 104 C88 80 103 70 119 65 C128 63 135 58 140 53 C145 58 152 63 161 65 C177 70 192 80 201 104 C200 70 177 44 140 44 Z" fill="#241f1c"/>',
'<path d="M80 96 C69 126 72 158 83 184 C88 156 76 132 90 104 Z" fill="#241f1c"/>',
'<path d="M200 96 C211 126 208 158 197 184 C192 156 204 132 190 104 Z" fill="#241f1c"/>',
'<path d="M104 72 C116 66 128 60 137 52" fill="none" stroke="#4a4148" stroke-width="2.4" stroke-linecap="round"/>',
'<path d="M70 150 C62 164 64 178 74 186" fill="none" stroke="#4a4148" stroke-opacity=".75" stroke-width="2.6" stroke-linecap="round"/>',
'<path d="M210 150 C218 164 216 178 206 186" fill="none" stroke="#4a4148" stroke-opacity=".75" stroke-width="2.6" stroke-linecap="round"/>',
'<path d="M58 118 C50 138 52 158 60 172" fill="none" stroke="#4a4148" stroke-opacity=".5" stroke-width="2.4" stroke-linecap="round"/>',
'<path d="M222 118 C230 138 228 158 220 172" fill="none" stroke="#4a4148" stroke-opacity=".5" stroke-width="2.4" stroke-linecap="round"/>',
'<path d="M174 74 C184 80 192 88 198 98" fill="none" stroke="#4a4148" stroke-width="2.2" stroke-linecap="round"/>',

// ---- 頬・鼻 ----
'<ellipse cx="101" cy="138" rx="10" ry="6" fill="#ef9f85" opacity=".7"/>',
'<ellipse cx="179" cy="138" rx="10" ry="6" fill="#ef9f85" opacity=".7"/>',
'<path d="M140 110 L137 123 Q140 127 144 124" fill="none" stroke="#241f1c" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>',

// ---- 眉（太くて濃い） ----
'<g id="gBrows" style="transition:transform .22s">',
  '<path id="browL" d="M103 86 Q120 75 136 85" fill="none" stroke="#241f1c" stroke-width="6.4" stroke-linecap="round"/>',
  '<path id="browR" d="M144 85 Q160 75 177 86" fill="none" stroke="#241f1c" stroke-width="6.4" stroke-linecap="round"/>',
'</g>',

// ---- 目 ----
'<g class="face-layer on" id="eyesOpen"><g class="blink" id="blinker">',
  '<ellipse cx="119" cy="112" rx="10.5" ry="9.5" fill="#fff"/>',
  '<ellipse cx="161" cy="112" rx="10.5" ry="9.5" fill="#fff"/>',
  '<g id="pupils" style="transition:transform .18s ease-out">',
    '<circle cx="119" cy="112.5" r="6.4" fill="#241f1c"/><circle cx="116.8" cy="109.8" r="2.2" fill="#fff"/>',
    '<circle cx="161" cy="112.5" r="6.4" fill="#241f1c"/><circle cx="158.8" cy="109.8" r="2.2" fill="#fff"/>',
  '</g>',
'</g></g>',
'<g class="face-layer" id="eyesSmile">',
  '<path d="M108 116 Q119 103 130 116" fill="none" stroke="#241f1c" stroke-width="5" stroke-linecap="round"/>',
  '<path d="M150 116 Q161 103 172 116" fill="none" stroke="#241f1c" stroke-width="5" stroke-linecap="round"/>',
'</g>',
'<g class="face-layer" id="eyesShut">',
  '<path d="M108 111 Q119 119 130 111" fill="none" stroke="#241f1c" stroke-width="4.6" stroke-linecap="round"/>',
  '<path d="M150 111 Q161 119 172 111" fill="none" stroke="#241f1c" stroke-width="4.6" stroke-linecap="round"/>',
'</g>',
'<g class="face-layer" id="eyesWide">',
  '<ellipse cx="119" cy="112" rx="11" ry="11" fill="#fff"/>',
  '<ellipse cx="161" cy="112" rx="11" ry="11" fill="#fff"/>',
  '<circle cx="119" cy="112.5" r="6.2" fill="#241f1c"/><circle cx="116.8" cy="109.8" r="2.2" fill="#fff"/>',
  '<circle cx="161" cy="112.5" r="6.2" fill="#241f1c"/><circle cx="158.8" cy="109.8" r="2.2" fill="#fff"/>',
'</g>',

// ---- 黒ぶちの丸メガネ（いちばんの目印） ----
'<g id="gGlasses">',
  '<path d="M101 102 L84 98" fill="none" stroke="#241f1c" stroke-width="3.4" stroke-linecap="round"/>',
  '<path d="M179 102 L196 98" fill="none" stroke="#241f1c" stroke-width="3.4" stroke-linecap="round"/>',
  '<path d="M101 106 C101 97 108 93 119 93 C130 93 137 97 137 106 C137 119 130 130 119 130 C108 130 101 119 101 106 Z" fill="none" stroke="#241f1c" stroke-width="4.4" stroke-linejoin="round"/>',
  '<path d="M143 106 C143 97 150 93 161 93 C172 93 179 97 179 106 C179 119 172 130 161 130 C150 130 143 119 143 106 Z" fill="none" stroke="#241f1c" stroke-width="4.4" stroke-linejoin="round"/>',
  '<path d="M137 101 Q140 97 143 101" fill="none" stroke="#241f1c" stroke-width="3.6" stroke-linecap="round"/>',
  '<path d="M107 104 Q110 99 116 98" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="2.6" stroke-linecap="round"/>',
  '<path d="M149 104 Q152 99 158 98" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.6" stroke-linecap="round"/>',
'</g>',

// ---- 口 ----
'<g class="face-layer on" id="mNormal"><path d="M127 147 Q140 158 153 147" fill="none" stroke="#241f1c" stroke-width="3.8" stroke-linecap="round"/></g>',
'<g class="face-layer" id="mThink"><path d="M128 151 Q139 144 151 152" fill="none" stroke="#241f1c" stroke-width="3.8" stroke-linecap="round"/></g>',
'<g class="face-layer" id="mFlat"><path d="M128 149 L152 149" fill="none" stroke="#241f1c" stroke-width="3.8" stroke-linecap="round"/></g>',
'<g class="face-layer" id="mSmile">',
  '<path d="M123 142 Q140 160 157 142 Z" fill="#8d4536" stroke="#241f1c" stroke-width="3" stroke-linejoin="round"/>',
  '<path d="M127 145 Q140 142 153 145 Q140 148 127 145 Z" fill="#fff"/>',
'</g>',
'<g class="face-layer" id="mGrin">',
  '<path d="M118 141 Q140 170 162 141 Z" fill="#8d4536" stroke="#241f1c" stroke-width="3" stroke-linejoin="round"/>',
  '<path d="M121 143 Q140 149 159 143 Q140 154 121 143 Z" fill="#fff"/>',
  '<path d="M130 145 L130 151 M140 146.5 L140 153 M150 145 L150 151" stroke="#d8d2c6" stroke-width="1.1"/>',
'</g>',
'<g class="face-layer" id="mOh"><ellipse cx="140" cy="149" rx="8.5" ry="11" fill="#8d4536" stroke="#241f1c" stroke-width="3"/></g>',

// ---- 口ひげと顎ひげ ----
'<path d="M122 137 C126 131 132 131 137 134" fill="none" stroke="#241f1c" stroke-width="4" stroke-linecap="round"/>',
'<path d="M158 137 C154 131 148 131 143 134" fill="none" stroke="#241f1c" stroke-width="4" stroke-linecap="round"/>',

'<path d="M128 162 C131 168 135 171 140 172 C145 171 149 168 152 162 C151 180 147 186 140 188 C133 186 129 180 128 162 Z" fill="#241f1c"/>',
'</g>'
].join('');

var FACES = {
  normal:   { eyes: 'eyesOpen',  mouth: 'mNormal', brow: 0,    gaze: [0, 0] },
  think:    { eyes: 'eyesOpen',  mouth: 'mThink',  brow: -2,   gaze: [4.5, -4.5] },
  smile:    { eyes: 'eyesSmile', mouth: 'mSmile',  brow: -1.5, gaze: [0, 0] },
  grin:     { eyes: 'eyesSmile', mouth: 'mGrin',   brow: -2.5, gaze: [0, 0] },
  surprise: { eyes: 'eyesWide',  mouth: 'mOh',     brow: -5,   gaze: [0, 0] },
  focus:    { eyes: 'eyesShut',  mouth: 'mFlat',   brow: 2,    gaze: [0, 0] },
  warm:     { eyes: 'eyesOpen',  mouth: 'mSmile',  brow: -1,   gaze: [0, 1.5] }
};

var genies = [];
var lastFace = 'normal';
var mouseGaze = [0, 0];

function mountGenie(el) {
  el.innerHTML = GENIE;
  genies.push(el);
  return el;
}

function applyGaze() {
  var f = FACES[lastFace] || FACES.normal;
  var x = (f.gaze[0] + mouseGaze[0]).toFixed(2);
  var y = (f.gaze[1] + mouseGaze[1]).toFixed(2);
  genies.forEach(function (root) {
    var p = root.querySelector('#pupils');
    if (p) p.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
  });
}

function setFace(name) {
  var f = FACES[name] || FACES.normal;
  var changed = name !== lastFace;
  lastFace = name;
  genies.forEach(function (root) {
    if (changed && !reduceMotion) {
      var body = root.querySelector('#gBody');
      if (body) {
        body.classList.remove('react');
        void body.getBoundingClientRect();
        body.classList.add('react');
      }
    }
    ['eyesOpen', 'eyesSmile', 'eyesShut', 'eyesWide'].forEach(function (k) {
      var n = root.querySelector('#' + k);
      if (n) n.classList.toggle('on', k === f.eyes);
    });
    ['mNormal', 'mThink', 'mFlat', 'mSmile', 'mGrin', 'mOh'].forEach(function (k) {
      var n = root.querySelector('#' + k);
      if (n) n.classList.toggle('on', k === f.mouth);
    });
    var b = root.querySelector('#gBrows');
    if (b) b.setAttribute('transform', 'translate(0 ' + f.brow + ')');
  });
  applyGaze();
}

// 目でマウスを追う
if (!reduceMotion) {
  var gazeAt = 0;
  addEventListener('pointermove', function (e) {
    var now = e.timeStamp || 0;
    if (now - gazeAt < 40) return;
    gazeAt = now;
    mouseGaze = [
      (e.clientX / innerWidth - 0.5) * 11,
      (e.clientY / innerHeight - 0.5) * 8
    ];
    applyGaze();
  }, { passive: true });

  // まばたき
  setInterval(function () {
    genies.forEach(function (root) {
      var bl = root.querySelector('#blinker');
      var open = root.querySelector('#eyesOpen');
      if (!bl || !open || !open.classList.contains('on')) return;
      bl.style.transition = 'none';
      bl.style.transform = 'scaleY(0.08)';
      setTimeout(function () {
        bl.style.transition = 'transform .12s';
        bl.style.transform = 'scaleY(1)';
      }, 85);
    });
  }, 4200);
}

/* ====================================================================
   2. 舞うほこり（背景）
==================================================================== */

(function dust() {
  if (reduceMotion) return;
  var cv = $('dust'), ctx = cv.getContext('2d'), w, h, dots = [], dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.width = innerWidth * dpr;
    h = cv.height = innerHeight * dpr;
  }
  resize();
  addEventListener('resize', resize);

  var COLORS = ['127,195,227', '242,134,111', '255,216,77'];
  function spawn(y) {
    return {
      x: Math.random() * w,
      y: y === undefined ? h + 20 * dpr : y,
      r: (1.5 + Math.random() * 3.5) * dpr,
      vy: (0.12 + Math.random() * 0.35) * dpr,
      sway: Math.random() * 6.2832,
      swayV: 0.004 + Math.random() * 0.01,
      a: 0.1 + Math.random() * 0.22,
      c: COLORS[(Math.random() * COLORS.length) | 0]
    };
  }
  for (var i = 0; i < 26; i++) dots.push(spawn(Math.random() * h));

  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      d.y -= d.vy;
      d.sway += d.swayV;
      ctx.fillStyle = 'rgba(' + d.c + ',' + d.a.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(d.x + Math.sin(d.sway) * 16 * dpr, d.y, d.r, 0, 6.2832);
      ctx.fill();
      if (d.y + d.r < -10) dots[i] = spawn();
    }
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ====================================================================
   3. 地理
==================================================================== */

var REGIONS = [
  ['北海道・東北', ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県']],
  ['関東', ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県']],
  ['甲信越・北陸', ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県']],
  ['東海', ['岐阜県', '静岡県', '愛知県', '三重県']],
  ['関西', ['滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県']],
  ['中国', ['鳥取県', '島根県', '岡山県', '広島県', '山口県']],
  ['四国', ['徳島県', '香川県', '愛媛県', '高知県']],
  ['九州・沖縄', ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']]
];

var NEIGHBOR = {
  '北海道': ['青森県'], '青森県': ['北海道', '岩手県', '秋田県'], '岩手県': ['青森県', '秋田県', '宮城県'],
  '宮城県': ['岩手県', '秋田県', '山形県', '福島県'], '秋田県': ['青森県', '岩手県', '宮城県', '山形県'],
  '山形県': ['秋田県', '宮城県', '福島県', '新潟県'],
  '福島県': ['宮城県', '山形県', '新潟県', '群馬県', '栃木県', '茨城県'],
  '茨城県': ['福島県', '栃木県', '埼玉県', '千葉県'], '栃木県': ['福島県', '茨城県', '群馬県', '埼玉県'],
  '群馬県': ['福島県', '栃木県', '埼玉県', '長野県', '新潟県'],
  '埼玉県': ['群馬県', '栃木県', '茨城県', '千葉県', '東京都', '山梨県', '長野県'],
  '千葉県': ['茨城県', '埼玉県', '東京都'], '東京都': ['埼玉県', '千葉県', '神奈川県', '山梨県'],
  '神奈川県': ['東京都', '山梨県', '静岡県'],
  '新潟県': ['山形県', '福島県', '群馬県', '長野県', '富山県'], '富山県': ['新潟県', '長野県', '岐阜県', '石川県'],
  '石川県': ['富山県', '岐阜県', '福井県'], '福井県': ['石川県', '岐阜県', '滋賀県', '京都府'],
  '山梨県': ['埼玉県', '東京都', '神奈川県', '静岡県', '長野県'],
  '長野県': ['群馬県', '埼玉県', '山梨県', '静岡県', '愛知県', '岐阜県', '富山県', '新潟県'],
  '岐阜県': ['富山県', '石川県', '福井県', '長野県', '愛知県', '三重県', '滋賀県'],
  '静岡県': ['神奈川県', '山梨県', '長野県', '愛知県'], '愛知県': ['長野県', '岐阜県', '三重県', '静岡県'],
  '三重県': ['岐阜県', '愛知県', '滋賀県', '京都府', '奈良県', '和歌山県'],
  '滋賀県': ['福井県', '岐阜県', '三重県', '京都府'],
  '京都府': ['福井県', '滋賀県', '三重県', '奈良県', '大阪府', '兵庫県'],
  '大阪府': ['京都府', '兵庫県', '奈良県', '和歌山県'], '兵庫県': ['京都府', '大阪府', '鳥取県', '岡山県', '徳島県'],
  '奈良県': ['京都府', '三重県', '大阪府', '和歌山県'], '和歌山県': ['大阪府', '奈良県', '三重県'],
  '鳥取県': ['兵庫県', '岡山県', '広島県', '島根県'], '島根県': ['鳥取県', '広島県', '山口県'],
  '岡山県': ['兵庫県', '鳥取県', '広島県', '香川県'], '広島県': ['岡山県', '鳥取県', '島根県', '山口県', '愛媛県'],
  '山口県': ['島根県', '広島県', '福岡県'],
  '徳島県': ['香川県', '愛媛県', '高知県', '兵庫県'], '香川県': ['徳島県', '愛媛県', '岡山県'],
  '愛媛県': ['香川県', '徳島県', '高知県', '広島県'], '高知県': ['愛媛県', '徳島県'],
  '福岡県': ['山口県', '佐賀県', '大分県', '熊本県'], '佐賀県': ['福岡県', '長崎県'], '長崎県': ['佐賀県'],
  '熊本県': ['福岡県', '大分県', '宮崎県', '鹿児島県'], '大分県': ['福岡県', '熊本県', '宮崎県'],
  '宮崎県': ['熊本県', '大分県', '鹿児島県'], '鹿児島県': ['熊本県', '宮崎県'], '沖縄県': []
};

/* ====================================================================
   4. 質問
==================================================================== */

var QUESTIONS = [
  {
    id: 'bldg', label: '建物', murmur: 'さて。', q: 'その物件、どんな建物？', cols2: true,
    opts: [
      { v: 'kominka', l: '古い家・空き家', s: '年季は入っとる', face: 'grin', re: 'おぉ、古い家ね！ そういうの探しとる人、けっこうおるよ' },
      { v: 'house', l: '一軒家・住宅', s: 'そのまま住めるな', face: 'smile', re: 'なるほど、家としてちゃんとしとるわけだ' },
      { v: 'apart', l: 'マンション・一室', s: '建物のなかのひと部屋', face: 'normal', re: 'ふむ、一室ね。小さく始めたい人がおるよ' },
      { v: 'tenant', l: '店舗・テナント', s: 'もとはお店だね', face: 'grin', re: 'お店か！ これは話が早いわ' },
      { v: 'warehouse', l: '倉庫・工場・蔵', s: '広くて、がらんと', face: 'surprise', re: 'おぉ倉庫！ これはおもしろい人が食いつくで' },
      { v: 'land', l: '土地・空き地', s: '建物はないんだね', face: 'think', re: '更地ね。畑とか庭から始めたい人、おったなあ' }
    ]
  },
  {
    id: 'size', label: '広さ', murmur: 'ふむ。', q: '広さはどれくらい？', cols2: true,
    opts: [
      { v: 's30', l: '〜30㎡', s: 'ひと部屋ぶん', face: 'normal', re: 'こぢんまり。ひとりで始める人にちょうどええね' },
      { v: 's60', l: '30〜60㎡', s: '1〜2部屋', face: 'normal', re: 'ええね、使いやすい広さだわ' },
      { v: 's100', l: '60〜100㎡', s: '一軒家くらい', face: 'smile', re: 'いちばん人気の広さだわ' },
      { v: 's200', l: '100〜200㎡', s: 'かなり広い', face: 'grin', re: '広いねえ！ やれること増えるわ' },
      { v: 's999', l: '200㎡以上', s: '倉庫・敷地つき', face: 'surprise', re: 'えっ、そんなに！ これは大物が釣れるで' }
    ]
  },
  {
    id: 'rent', label: '家賃', murmur: 'ところで。', q: '家賃は月いくらぐらい？', cols2: true,
    opts: [
      { v: 'r3', l: '〜3万円', s: '', face: 'grin', re: 'おぉ、それは借りる側は大助かりだわ' },
      { v: 'r5', l: '3〜5万円', s: '', face: 'smile', re: 'うん、手が届きやすい値段だね' },
      { v: 'r10', l: '5〜10万円', s: '', face: 'normal', re: 'なるほど、相場どころだわ' },
      { v: 'r20', l: '10〜20万円', s: '', face: 'think', re: 'ふむ…本気の人を選ばんとね' },
      { v: 'r99', l: '20万円以上', s: '', face: 'surprise', re: 'ほう、しっかりした物件とみた' },
      { v: 'rx', l: '相談して決めたい', s: '', face: 'warm', re: 'それがいちばんええよ。人を見て決めりゃあいい' }
    ]
  },
  {
    id: 'renov', label: '改装', murmur: 'さて、ここからが肝心。', q: '中、好きに変えてもいい？',
    opts: [
      { v: 'free', l: '好きにしてくれていい', s: 'DIY・改装おおいに歓迎', face: 'grin', re: 'いちばん喜ばれる返事だわ！ 腕の鳴る人が寄ってくるで' },
      { v: 'discuss', l: '相談してくれるなら', s: '話し合って決めたい', face: 'smile', re: 'それでええよ。一緒に決めるのが筋だもんで' },
      { v: 'keep', l: 'なるべくこのままで', s: '原状回復してほしい', face: 'think', re: 'ふむ、大事に使ってくれる人を探そか' }
    ]
  },
  {
    id: 'fire', label: '飲食', murmur: '', q: '火と水を使うお店（飲食）は、やってもいい？',
    opts: [
      { v: 'ok', l: 'かまわんよ', s: '厨房を入れてもOK', face: 'grin', re: 'よしきた。これで候補がぐっと広がるわ' },
      { v: 'discuss', l: '内容によっては', s: '相談しだい', face: 'normal', re: 'ふむ、慎重だね。悪くないよ' },
      { v: 'ng', l: 'それは難しい', s: '火は使ってほしくない', face: 'think', re: '了解。火を使わん人から探すわ' }
    ]
  },
  {
    id: 'live', label: '住む', murmur: '', q: 'そこに誰かが住んでもいい？',
    opts: [
      { v: 'ok', l: '住んでくれていい', s: '暮らしの場にしてOK', face: 'warm', re: '住んでもらえると、家って長持ちするもんで' },
      { v: 'discuss', l: '住居としても相談可', s: '話しだい', face: 'normal', re: 'うん、ふくみ持たせるのは賢いわ' },
      { v: 'ng', l: '住むのはなし', s: 'お店・仕事場として', face: 'normal', re: '了解。昼間に使う人を探すね' }
    ]
  },
  {
    id: 'lively', label: 'にぎわい', murmur: 'もうひとつ。', q: '人がわいわい集まるのは、どう？',
    opts: [
      { v: 'welcome', l: 'にぎやかなのは大歓迎', s: 'イベントもどんどん', face: 'grin', re: 'ええねえ！ 町が明るくなるわ' },
      { v: 'moderate', l: 'ほどほどなら', s: '近所に配慮してくれれば', face: 'smile', re: 'それが現実的ってもんだわ' },
      { v: 'quiet', l: '静かに使ってほしい', s: '近所が気になる', face: 'think', re: '了解。落ち着いた人を見立てるわ' }
    ]
  },
  {
    id: 'sell', label: '売却', murmur: '', q: 'いつか手放す（売る）ことも考えとる？',
    opts: [
      { v: 'sell', l: '売りたい気持ちもある', s: '買ってくれるならそれでも', face: 'surprise', re: 'えっ、そうなんだ。買う気のある人も視野に入れるわ' },
      { v: 'maybe', l: '条件しだいでは', s: 'いい相手なら考える', face: 'normal', re: 'ふむ、ふくみ持たせとこか' },
      { v: 'rent', l: '貸すだけでいい', s: '手放す気はない', face: 'smile', re: '了解。長く借りてくれる人がええね' }
    ]
  },
  {
    id: 'wish', label: 'どんな人に', murmur: 'じゃあ最後に。', q: 'どんな人に使ってほしい？', cols2: true,
    opts: [
      { v: 'open', l: '地域にひらく人', s: '町の人が集まる場に', face: 'warm', re: 'ええ願いだわ。しっかり視るね' },
      { v: 'long', l: '長く続ける人', s: '腰を据えてほしい', face: 'warm', re: '続くのがいちばん難しくて、いちばん尊いもんで' },
      { v: 'fun', l: '面白いことをする人', s: '見たことのない使い方を', face: 'grin', re: 'オレもそれが見たい！' },
      { v: 'careful', l: '丁寧に大事に使う人', s: '思い出のある家だから', face: 'warm', re: '…うん。その気持ち、ちゃんと汲むわ' }
    ]
  }
];

var RENT_MID = { r3: 25000, r5: 40000, r10: 75000, r20: 150000, r99: 260000, rx: null };
var SIZE_RANGE = { s30: [0, 30], s60: [30, 60], s100: [60, 100], s200: [100, 200], s999: [200, 99999] };

/* ====================================================================
   5. 占う
==================================================================== */

var BLDG_LABEL = {
  kominka: '古民家・空き家', house: '一軒家・戸建', tenant: '店舗・テナント',
  warehouse: '倉庫・工場', apart: 'マンション・アパート', land: '土地・空き地'
};

var WISH_TAGS = {
  open:    ['community', 'kids', 'care', 'farm', 'book'],
  long:    ['care', 'live', 'farm', 'school', 'beauty'],
  fun:     ['art', 'atelier', 'stay', 'sports', 'shop'],
  careful: ['book', 'beauty', 'atelier', 'cafe', 'school']
};
var WISH_LABEL = { open: '地域にひらく', long: '長く続ける', fun: '面白いこと', careful: '丁寧に使う' };

function man(yen) {
  if (yen == null) return '相談';
  if (yen >= 10000) {
    var v = yen / 10000;
    return (v >= 10 ? Math.round(v) : Math.round(v * 10) / 10) + '万円';
  }
  return Math.round(yen / 1000) + '千円';
}

function scorePerson(x, A, areaKind) {
  var s = 0, why = [], ng = false, kind = areaKind;

  /* --- 場所 --- */
  var prs = x.pr || [];
  if (areaKind === 'exact') {
    var cityHit = null;
    if (A.cityWord && ((x.ct || {})[A.pref] || []).indexOf(A.cityWord) >= 0) cityHit = A.cityWord;
    if (prs.indexOf(A.pref) >= 0) {
      s += 30;
      if (cityHit) { s += 11; why.push({ t: cityHit + 'を名指しで探している', hot: true }); }
      else if (A.cityWord) { why.push({ t: A.pref + '内で探している', hot: false }); }
      else why.push({ t: A.pref + 'で探している', hot: false });
    } else if (prs.length === 1) {
      s += 23;
      why.push({ t: '場所はどこでもよいとのこと', hot: false });
    } else {
      s += 17;
      why.push({ t: '全国で探し中（主に' + prs.filter(function (p) { return p !== '全国'; }).slice(0, 2).join('・') + '）', hot: false, warn: true });
    }
  } else if (areaKind === 'near') {
    s += 15;
    why.push({ t: '隣の' + prs.filter(function (p) { return (NEIGHBOR[A.pref] || []).indexOf(p) >= 0; }).slice(0, 2).join('・') + 'で探し中', hot: false });
  } else {
    s += 4;
    why.push({ t: '遠方だが、条件はよく合う', hot: false });
  }

  /* --- 家賃 --- */
  var mine = RENT_MID[A.rent] != null ? RENT_MID[A.rent] : null;
  if (mine == null || (x.rm == null && x.rf)) {
    s += 16;
    if (x.rf) why.push({ t: '金額は相談したいとのこと', hot: false });
  } else if (x.rm == null) {
    s += 13;
  } else {
    var ratio = x.rm / mine;
    if (ratio >= 1.15) { s += 22; why.push({ t: '家賃の予算に余裕がある', hot: true }); }
    else if (ratio >= 0.95) { s += 21; why.push({ t: '家賃の予算がぴたり合う', hot: true }); }
    else if (ratio >= 0.78) { s += 14; }
    else if (ratio >= 0.6) { s += 7; why.push({ t: '家賃は少し相談が要りそう', hot: false, warn: true }); }
    else { s += 1; why.push({ t: '家賃は要相談（予算は低め）', hot: false, warn: true }); }
    if (x.rf && ratio < 0.95) s += 4;
  }

  /* --- 広さ --- */
  var r = SIZE_RANGE[A.size];
  if (!r || (x.smin == null && x.smax == null)) {
    s += 9;
  } else {
    var lo = x.smin != null ? x.smin : 0;
    var hi = x.smax != null ? x.smax : 99999;
    if (r[1] >= lo && r[0] <= hi) {
      s += 14;
      if (x.smin) why.push({ t: x.smin + '㎡以上を希望', hot: false });
    } else if (r[1] < lo) {
      s += (lo / Math.max(r[1], 1)) < 1.4 ? 7 : 1;
      why.push({ t: 'もう少し広い物件を探している', hot: false, warn: true });
    } else {
      s += 6;
    }
  }

  /* --- 使い方の相性 --- */
  var u = x.u || [], f = x.f || [];
  var isFood = u.indexOf('cafe') >= 0 || u.indexOf('food') >= 0;
  var isLive = u.indexOf('live') >= 0;
  var isStay = u.indexOf('stay') >= 0;

  s += 10;
  if (isFood) {
    if (A.fire === 'ok') { s += 8; why.push({ t: '飲食OKがこの人に効く', hot: true }); }
    else if (A.fire === 'discuss') { s += 3; why.push({ t: '飲食をやりたい人。要相談', hot: false, warn: true }); }
    else { ng = true; }
  } else if (A.fire === 'ng') {
    s += 5; why.push({ t: '火は使わない使い方', hot: false });
  } else { s += 3; }

  if (isLive || isStay) {
    if (A.live === 'ok') { s += 8; why.push({ t: isStay ? '泊まれる場所にしたい人' : '住まいとして使いたい人', hot: true }); }
    else if (A.live === 'discuss') { s += 3; }
    else if (isLive) { ng = true; }
    else { s += 1; }
  } else {
    s += A.live === 'ng' ? 5 : 3;
  }

  if (f.indexOf('lively') >= 0) {
    if (A.lively === 'welcome') { s += 5; why.push({ t: '人が集まる場をつくりたい', hot: true }); }
    else if (A.lively === 'moderate') { s += 2; }
    else { s -= 7; why.push({ t: 'にぎやかになるかもしれない', hot: false, warn: true }); }
  } else if (A.lively === 'quiet') {
    s += 4; why.push({ t: '静かに使ってくれそう', hot: false });
  }

  if (A.bldg && (x.b || []).indexOf(A.bldg) >= 0) {
    s += 7; why.push({ t: BLDG_LABEL[A.bldg] + 'を探している', hot: true });
  } else if (!(x.b || []).length) {
    s += 2;
  }
  if (A.bldg === 'land' && u.indexOf('farm') >= 0) { s += 5; why.push({ t: '土地・畑を活かしたい人', hot: true }); }

  /* --- 改装 --- */
  var wantsReno = f.indexOf('renov') >= 0;
  if (A.renov === 'free') {
    if (wantsReno) { s += 12; why.push({ t: '自分で手を入れたい人', hot: true }); }
    else s += 8;
  } else if (A.renov === 'discuss') {
    s += wantsReno ? 8 : 7;
  } else {
    if (wantsReno) { s += 1; why.push({ t: '改装したい意向あり。要相談', hot: false, warn: true }); }
    else { s += 9; why.push({ t: '大きく手を入れなくてよさそう', hot: false }); }
  }

  /* --- 売却 --- */
  if (A.sell === 'sell') {
    if (x.bm) { s += 8; why.push({ t: '買い取りも検討している', hot: true }); }
    else if (x.bf) { s += 5; why.push({ t: '購入も相談可とのこと', hot: false }); }
  } else if (A.sell === 'maybe') {
    s += x.bm ? 6 : 3;
  } else {
    s += x.bn ? 6 : 4;
  }

  /* --- 願い --- */
  var tags = WISH_TAGS[A.wish] || [];
  var hit = u.filter(function (k) { return tags.indexOf(k) >= 0; });
  if (hit.length) {
    s += hit.length >= 2 ? 10 : 6;
    why.push({ t: WISH_LABEL[A.wish] + '——まさにこの人', hot: true });
  }
  if (A.wish === 'careful' && !wantsReno) s += 3;
  if (A.wish === 'fun' && (x.b || []).indexOf('warehouse') >= 0) s += 3;

  return { x: x, s: s, why: why, ng: ng, kind: kind };
}

var MAX_SCORE = 135;

// 「わからない」で飛ばされた質問は、いちばん当たりさわりのない答えとして扱う
function withDefaults(a) {
  return {
    pref: a.pref,
    cityWord: a.cityWord || null,
    bldg: a.bldg || null, size: a.size || null, rent: a.rent || null,
    renov: a.renov || 'discuss', fire: a.fire || 'discuss', live: a.live || 'discuss',
    lively: a.lively || 'moderate', sell: a.sell || 'maybe', wish: a.wish || null
  };
}

// pool をひとつ作る。exact が足りなければ隣県→全国へ広げる
function buildPool(list, A, minWanted) {
  var nb = NEIGHBOR[A.pref] || [];
  var exact = [], near = [], far = [];
  list.forEach(function (x) {
    var pr = x.pr || [];
    if (pr.indexOf(A.pref) >= 0 || pr.indexOf('全国') >= 0) exact.push(x);
    else if (pr.some(function (p) { return nb.indexOf(p) >= 0; })) near.push(x);
    else far.push(x);
  });

  // その県を名指ししている人が少なければ、隣の県の人にも声をかける
  var named = exact.filter(function (x) { return (x.pr || []).indexOf(A.pref) >= 0; }).length;
  var pool = exact.map(function (x) { return scorePerson(x, A, 'exact'); }).filter(function (r) { return !r.ng; });
  if (named < minWanted || pool.length < minWanted) {
    pool = pool.concat(near.map(function (x) { return scorePerson(x, A, 'near'); }).filter(function (r) { return !r.ng; }));
  }
  if (pool.length < minWanted) {
    pool = pool.concat(far.map(function (x) { return scorePerson(x, A, 'far'); }).filter(function (r) { return !r.ng; }));
  }
  // 条件がきつすぎて誰も残らないときは、除外した人も戻してやる
  if (!pool.length) {
    pool = exact.concat(near, far).map(function (x) { return scorePerson(x, A, 'exact'); });
  }
  pool.forEach(function (r) { r.j = r.s + (Math.random() * 2.4 - 1.2); });
  pool.sort(function (a, b) { return b.j - a.j; });

  var nPref = exact.filter(function (x) { return (x.pr || []).indexOf(A.pref) >= 0; }).length;
  return { pool: pool, nPref: nPref, nAny: exact.length - nPref };
}

function divine(rawA) {
  var A = withDefaults(rawA);
  var now = buildPool(OPEN, A, 3);
  var past = buildPool(DONE, A, 2);
  return {
    pool: now.pool.slice(0, 9),
    nPref: now.nPref,
    nAny: now.nAny,
    past: past.pool.slice(0, 3)
  };
}

/* ====================================================================
   6. 画面
==================================================================== */

var A = {};
var qi = 0;
var pickedRegion = null;
var result = null;
var shown = 0;
var pastShown = false;
var busy = false;
var footEl = document.querySelector('footer.foot');

var SCREENS = ['screen-intro', 'screen-pref', 'screen-quiz', 'screen-divine', 'screen-result', 'screen-terms'];

function show(id) {
  SCREENS.forEach(function (k) { $(k).classList.toggle('is-on', k === id); });
  footEl.style.display = (id === 'screen-intro' || id === 'screen-result') ? '' : 'none';
  window.scrollTo(0, 0);
}

function dots(el, n, lit) {
  el.innerHTML = '';
  for (var i = 0; i < n; i++) {
    var d = document.createElement('i');
    if (i < lit) d.className = 'lit';
    el.appendChild(d);
  }
}

var TOTAL_STEPS = QUESTIONS.length + 3;

// その県の全市区町村（総務省のコード表）を、探している人が多い順に並べ替えて返す
var cityCache = {};

function citiesOf(pref) {
  if (cityCache[pref]) return cityCache[pref];

  var all = (window.MUNI || {})[pref] || [];
  var count = {};
  OPEN.forEach(function (x) {
    var list = (x.ct || {})[pref];
    if (!list) return;
    list.forEach(function (c) { count[c] = (count[c] || 0) + 1; });
  });

  // 探している人がいる市町村を先に、残りはコード表の順のまま
  var hot = [], rest = [];
  all.forEach(function (c) { (count[c] ? hot : rest).push(c); });
  hot.sort(function (a, b) { return count[b] - count[a] || a.localeCompare(b, 'ja'); });

  var out = hot.concat(rest);
  cityCache[pref] = out;
  return out;
}

// その市町村を探している人がいるか（ボタンに印をつける）
function cityWanted(pref, city) {
  for (var i = 0; i < OPEN.length; i++) {
    var list = (OPEN[i].ct || {})[pref];
    if (list && list.indexOf(city) >= 0) return true;
  }
  return false;
}

/* --- エリア・都道府県 --- */

function renderRegion() {
  dots($('progPref'), TOTAL_STEPS, 0);
  $('prefMurmur').textContent = 'さて。';
  $('prefQuestion').textContent = 'その物件、どのあたりにあるの？';
  $('prefHint').textContent = 'エリアを選ぶ';
  var g = $('prefGrid');
  g.className = 'pref-grid';
  g.innerHTML = '';
  $('screen-pref').dataset.rows = 4;
  REGIONS.forEach(function (r) {
    var b = document.createElement('button');
    b.className = 'btn';
    b.textContent = r[0] + 'エリア';
    b.onclick = function () { pickedRegion = r; renderPref(); };
    g.appendChild(b);
  });
  $('prefBack').onclick = function () { show('screen-intro'); setFace('normal'); };
  setFace('normal');
  show('screen-pref');
}

function renderPref() {
  dots($('progPref'), TOTAL_STEPS, 1);
  $('prefMurmur').textContent = 'お、' + pickedRegion[0] + 'ね。';
  $('prefQuestion').textContent = 'もうちょい詳しく聞くね。';
  $('prefHint').textContent = pickedRegion[0] + 'エリアの中から';
  var g = $('prefGrid');
  g.className = 'pref-grid cols-3';
  g.innerHTML = '';
  $('screen-pref').dataset.rows = Math.ceil(pickedRegion[1].length / 3);
  pickedRegion[1].forEach(function (p) {
    var b = document.createElement('button');
    b.className = 'btn';
    b.textContent = p.replace(/[都道府県]$/, '');
    b.onclick = function () { A.pref = p; A.cityWord = null; cityPage = 0; renderCity(); };
    g.appendChild(b);
  });
  $('prefBack').onclick = renderRegion;
  setFace('think');
  show('screen-pref');
}

var CITY_PER_PAGE = 8;
var cityPage = 0;

function renderCity() {
  var list = citiesOf(A.pref);
  if (!list.length) { qi = 0; renderQ(); return; }

  var pages = Math.ceil(list.length / CITY_PER_PAGE);
  if (cityPage >= pages) cityPage = pages - 1;
  if (cityPage < 0) cityPage = 0;
  var slice = list.slice(cityPage * CITY_PER_PAGE, (cityPage + 1) * CITY_PER_PAGE);

  dots($('progPref'), TOTAL_STEPS, 2);
  $('prefMurmur').textContent = A.pref + 'ね。';
  $('prefQuestion').textContent = 'もっと近いところで探す？';
  var hotHere = slice.filter(function (c) { return cityWanted(A.pref, c); }).length;
  $('prefHint').textContent = [
    hotHere ? '● 探しとる人がおる場所' : '',
    pages > 1 ? (cityPage + 1) + ' / ' + pages : ''
  ].filter(Boolean).join('　') || '選ばなくてもいいよ';

  var g = $('prefGrid');
  g.className = 'pref-grid';
  g.innerHTML = '';
  $('screen-pref').dataset.rows = 1 + Math.ceil(slice.length / 2) + (pages > 1 ? 1 : 0);

  var skip = document.createElement('button');
  skip.className = 'btn city-skip';
  skip.textContent = '市町村を絞り込まずに次に進む';
  skip.onclick = function () { A.cityWord = null; qi = 0; renderQ(); };
  g.appendChild(skip);

  slice.forEach(function (c) {
    var b = document.createElement('button');
    b.className = 'btn' + (cityWanted(A.pref, c) ? ' city-hot' : '');
    b.textContent = c;
    b.onclick = function () { A.cityWord = c; qi = 0; renderQ(); };
    g.appendChild(b);
  });

  if (pages > 1) {
    var nav = document.createElement('div');
    nav.className = 'city-pager';
    var prev = document.createElement('button');
    prev.className = 'btn pager-btn';
    prev.textContent = '← 前';
    prev.disabled = cityPage === 0;
    prev.onclick = function () { cityPage--; renderCity(); };
    var next = document.createElement('button');
    next.className = 'btn pager-btn';
    next.textContent = '次 →';
    next.disabled = cityPage >= pages - 1;
    next.onclick = function () { cityPage++; renderCity(); };
    nav.appendChild(prev);
    nav.appendChild(next);
    g.appendChild(nav);
  }

  $('prefBack').onclick = function () { cityPage = 0; renderPref(); };
  setFace('normal');
  show('screen-pref');
}

/* --- 質問 --- */

function renderQ() {
  var q = QUESTIONS[qi];
  dots($('prog'), TOTAL_STEPS, qi + 3);
  $('qMurmur').textContent = q.murmur || '';
  $('qMurmur').style.display = q.murmur ? '' : 'none';
  $('qText').textContent = q.q;
  var bub = $('qBubble');
  bub.style.animation = 'none';
  void bub.offsetWidth;
  bub.style.animation = '';
  setFace(qi === 0 ? 'normal' : 'think');

  var c = $('choices');
  c.className = 'choices' + (q.cols2 ? ' cols-2' : '');
  $('screen-quiz').dataset.rows = q.cols2 ? Math.ceil(q.opts.length / 2) : q.opts.length;
  c.innerHTML = '';
  q.opts.forEach(function (o) {
    var b = document.createElement('button');
    b.className = 'btn';
    b.innerHTML = esc(o.l) + (o.s ? '<span class="sub">' + esc(o.s) + '</span>' : '');
    b.onclick = function () { answer(q, o, b); };
    c.appendChild(b);
  });

  $('qBack').onclick = function () {
    if (qi === 0) { if (citiesOf(A.pref).length) renderCity(); else renderPref(); }
    else { qi--; renderQ(); }
  };
  $('qSkip').onclick = function () { A[q.id] = null; nextQ(); };
  show('screen-quiz');
}

var waitTimer = 0;

function finishReaction() {
  if (!busy) return;
  clearTimeout(waitTimer);
  busy = false;
  nextQ();
}

function answer(q, o, btn) {
  if (busy) return;
  busy = true;
  A[q.id] = o.v;
  btn.classList.add('is-picked');
  Array.prototype.forEach.call($('choices').children, function (n) { n.disabled = true; });
  setFace(o.face || 'smile');
  $('qMurmur').style.display = 'none';
  $('qText').textContent = o.re;
  waitTimer = setTimeout(finishReaction, reduceMotion ? 150 : 900);
}

function nextQ() {
  qi++;
  if (qi >= QUESTIONS.length) startDivine();
  else renderQ();
}

/* --- 占い中 --- */

var DIVINE_LINES = ['んー……', 'なんかざわついとるな', '……おる。確実におるわ', '視えた'];
var RESULT_LINES = [
  'こういう人、どう？',
  'ええ出会いが視えたわ。',
  'オレの見立てだと、この人。',
  'その物件、こう使われるとみた。'
];


function startDivine() {
  show('screen-divine');
  setFace('focus');
  result = divine(A);
  preloadSheets(result.pool.concat(result.past));
  shown = 0;
  pastShown = false;
  var i = 0;
  $('divineText').textContent = DIVINE_LINES[0];
  var iv = setInterval(function () {
    i++;
    if (i < DIVINE_LINES.length) {
      $('divineText').textContent = DIVINE_LINES[i];
      if (i === 2) setFace('think');
      if (i === 3) setFace('surprise');
    } else {
      clearInterval(iv);
      burst();
    }
  }, reduceMotion ? 220 : 1000);
}

function preloadSheets(list) {
  var seen = {};
  list.slice(0, 8).forEach(function (r) {
    var k = r.x.sp;
    if (k == null || seen[k]) return;
    seen[k] = 1;
    var im = new Image();
    im.src = 'img/sheet-' + k + '.webp';
  });
}

function burst() {
  var fl = $('flash');
  fl.classList.remove('go');
  void fl.offsetWidth;
  if (!reduceMotion) { fl.classList.add('go'); sparkle(); }
  setTimeout(renderResult, reduceMotion ? 120 : 440);
}

function sparkle() {
  var cv = $('burstCanvas'), ctx = cv.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
  cv.style.display = 'block';
  var cx = cv.width / 2, cy = cv.height * 0.54, ps = [];
  var cols = ['#ffd84d', '#f2866f', '#7fc3e3', '#241f1c'];
  for (var i = 0; i < 80; i++) {
    var a = Math.random() * 6.2832, v = (2 + Math.random() * 9) * dpr;
    ps.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2 * dpr,
              r: (1.6 + Math.random() * 3) * dpr, life: 1, c: cols[(Math.random() * 4) | 0] });
  }
  var t0 = performance.now(), tStart = t0;
  setTimeout(function () { ctx.clearRect(0, 0, cv.width, cv.height); cv.style.display = 'none'; }, 2200);
  (function loop(t) {
    var dt = Math.min((t - t0) / 16.7, 3); t0 = t;
    ctx.clearRect(0, 0, cv.width, cv.height);
    var alive = 0;
    ps.forEach(function (p) {
      if (p.life <= 0) return;
      alive++;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 0.17 * dpr * dt; p.vx *= 0.985; p.life -= 0.014 * dt;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (alive && t - tStart < 4000) requestAnimationFrame(loop);
    else { ctx.clearRect(0, 0, cv.width, cv.height); cv.style.display = 'none'; }
  })(performance.now());
}

/* --- 結果 --- */

function pickCount(pool) {
  if (!pool.length) return 0;
  if (pool.length === 1) return 1;
  var top = pool[0].s, n = 1;
  for (var i = 1; i < Math.min(pool.length, 3); i++) {
    if (pool[i].s >= top - 9) n++;
    else break;
  }
  return n;
}

var SHEET_COLS = window.SHEET_COLS || 6;

function thumbStyle(x) {
  var cols = SHEET_COLS, rows = x.sn || SHEET_COLS;
  var px = cols > 1 ? (x.sc / (cols - 1)) * 100 : 0;
  var py = rows > 1 ? (x.sr / (rows - 1)) * 100 : 0;
  return 'background-image:url(img/sheet-' + x.sp + '.webp);' +
         'background-size:' + (cols * 100) + '% ' + (rows * 100) + '%;' +
         'background-position:' + px.toFixed(3) + '% ' + py.toFixed(3) + '%';
}

function renderResult() {
  var pool = result.pool;
  var box = $('cards');
  box.innerHTML = '';
  $('pastWrap').innerHTML = '';
  pastShown = false;
  $('btnPast').textContent = 'すでに決まった人の例も見る';
  $('btnPast').style.display = result.past.length ? '' : 'none';

  if (!pool.length) {
    $('verdictText').innerHTML = '……ごめん。<em>今は</em>見つからんわ';
    $('areaNote').textContent = '条件をちょっと変えて、もう一回占ってみて。';
    box.innerHTML = '<p class="empty-note">火を使うお店も、住むのも難しい——っていう条件だと、いまの掲載者とはつながらんかった。<br>「相談しだい」にすると、ぐっと広がるよ。</p>';
    $('btnMore').style.display = 'none';
    renderRecap();
    show('screen-result');
    return;
  }

  var n = shown === 0 ? pickCount(pool) : Math.min(shown + 2, pool.length);
  shown = n;

  $('verdictText').innerHTML = '<small>あなたの物件と相性がよさそうなのは</small>'
    + (n === 1 ? '<em>この人</em>' : '<em>この' + n + '人</em>');

  var kinds = pool.slice(0, n).map(function (r) { return r.kind; });
  var note;
  if (kinds.indexOf('far') >= 0) {
    note = A.pref + 'で探しとる人は見当たらんかった。遠いけど、条件のよく合う人を視たよ。';
  } else if (kinds.indexOf('near') >= 0) {
    note = result.nPref
      ? A.pref + 'の人は ' + result.nPref + ' 人と少なくてね。隣の県まで広げて視たよ。'
      : A.pref + 'を名指しで探しとる人は、まだおらんかった。隣の県とか「どこでもええ」っていう人まで広げて視たよ。';
  } else if (result.nPref) {
    note = A.pref + 'で探しとる ' + result.nPref + ' 人';
    if (A.cityWord) note += '（' + A.cityWord + 'のあたりを重めに見たよ）';
    if (result.nAny) note += 'と、場所を問わん ' + result.nAny + ' 人';
    note += 'の中から視たよ。';
  } else {
    note = A.pref + 'を名指しの人はまだおらんけど、場所を問わん ' + result.nAny + ' 人の中から視たよ。';
  }
  $('areaNote').textContent = note;

  for (var i = 0; i < n; i++) box.appendChild(card(pool[i], i, false));

  $('btnMore').style.display = pool.length > n ? '' : 'none';
  $('btnMore').textContent = 'ほかの候補も見る（あと' + (pool.length - n) + '人）';

  $('resultBubble').textContent = RESULT_LINES[(Math.random() * RESULT_LINES.length) | 0];
  renderRecap();
  show('screen-result');
  setFace('grin');
  growMeters();
}

function growMeters() {
  requestAnimationFrame(function () {
    Array.prototype.forEach.call(document.querySelectorAll('.fit-meter span'), function (el) {
      el.style.width = el.dataset.w + '%';
    });
  });
}

function showPast() {
  var wrap = $('pastWrap');
  if (pastShown) { wrap.innerHTML = ''; pastShown = false; $('btnPast').textContent = 'すでに決まった人の例も見る'; return; }
  wrap.innerHTML = '<h3 class="past-head">こんな使われ方もある</h3>' +
    '<p class="past-note">すでに物件が決まった人と、募集を終えた人。いまは探しとらんけど、物件の使いみちの見本になるよ。</p>';
  result.past.forEach(function (r, i) { wrap.appendChild(card(r, i, true)); });
  pastShown = true;
  $('btnPast').textContent = '決まった人の例を閉じる';
  growMeters();
  growMeters();
  wrap.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
}

function card(r, idx, isPast) {
  var x = r.x;
  var pct = Math.max(46, Math.min(97, Math.round(40 + (r.s / MAX_SCORE) * 58)));
  var el = document.createElement('article');
  el.className = 'card rank-' + (isPast ? 2 : idx + 1) + (isPast ? ' past-card' : '');
  el.style.animationDelay = (idx * 0.12) + 's';

  var lead = !isPast && idx === 0;
  var why = r.why.filter(function (w) { return w.hot || w.warn; }).slice(0, lead ? 4 : 2);
  if (why.length < 2) why = r.why.slice(0, lead ? 3 : 2);

  var specs = [['AREA', x.a || (x.pr || []).join('・')], ['RENT', x.rt || '記載なし']];
  if (lead) {
    specs.push(['SIZE', x.sz || '記載なし']);
    if (x.ot) specs.push(['OTHER', x.ot]);
  }

  var badge = isPast
    ? '<div class="rank-badge past">' + esc(x.stl || '募集終了') + '</div>'
    : '<div class="rank-badge">' + (idx === 0 ? 'いちばん相性がいい人' : (idx + 1) + '番目に相性がいい人') + '</div>';

  el.innerHTML =
    '<div class="card-photo">' + badge +
      '<div class="thumb" style="' + thumbStyle(x) + '" role="img" aria-label="' + esc(x.n) + 'さんの写真"></div>' +
    '</div>' +
    '<div class="card-head">' +
      '<h3 class="card-name">' + esc(x.n || '（お名前非公開）') + '</h3>' +
      (x.r ? '<div class="card-roll">' + esc(x.r) + '</div>' : '') +
    '</div>' +
    '<div class="card-body">' +
      (isPast ? '' :
        '<div class="fit-row">' +
          '<span class="fit-label">相性</span>' +
          '<span class="fit-meter"><span data-w="' + pct + '"></span></span>' +
          '<span class="fit-num">' + pct + '%</span>' +
        '</div>') +
      '<h4 class="card-title">' + esc(x.t) + '</h4>' +
      '<p class="card-text">' + esc(trim(x.w, lead ? 102 : 62)) + '</p>' +
      '<div class="why">' + why.map(function (w) {
        return '<span' + (w.warn ? ' class="warn"' : '') + '>' + esc(w.t) + '</span>';
      }).join('') + '</div>' +
      '<dl class="specs">' + specs.map(function (sp) {
        return '<dt>' + sp[0] + '</dt><dd>' + esc(trim(sp[1], lead ? 90 : 46)) + '</dd>';
      }).join('') + '</dl>' +
      '<div class="card-cta">' +
        '<a href="' + esc(x.url) + '" target="_blank" rel="noopener">' +
          (isPast ? 'この人のページを見る' : 'この人の詳細を見て連絡する') +
        '</a>' +
      '</div>' +
    '</div>';
  return el;
}

function renderRecap() {
  var labels = ['場所：' + A.pref + (A.cityWord ? ' ' + A.cityWord : '')];
  QUESTIONS.forEach(function (q) {
    var v = A[q.id];
    if (!v) return;
    var o = q.opts.filter(function (k) { return k.v === v; })[0];
    if (o) labels.push((q.label || '') + '：' + o.l);
  });
  $('recap').innerHTML = '<b>あなたの答え</b><br>' + labels.map(esc).join('　/　');
}

/* --- 小物 --- */

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function trim(s, n) {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function toast(msg) {
  var t = $('toast');
  t.textContent = msg;
  t.classList.add('on');
  setTimeout(function () { t.classList.remove('on'); }, 1900);
}

function showCopyBox(txt) {
  var box = $('copyBox');
  box.innerHTML = '<p class="copy-note">自動でコピーできんかった。ここを選んで写してね。</p><textarea readonly rows="7"></textarea>';
  box.querySelector('textarea').value = txt;
  box.style.display = '';
  box.querySelector('textarea').select();
}

function copyText(txt) {
  function fallback() {
    var ta = document.createElement('textarea');
    ta.value = txt;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, txt.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    if (ok) toast('コピーしました'); else showCopyBox(txt);
  }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(txt).then(function () {
      toast('コピーしました');
      $('copyBox').style.display = 'none';
    }, fallback);
  } else { fallback(); }
}

/* --- トップで奥田にさわる --- */

var OKUDA_LINES = [
  'お、来たね', 'まかせといて', '物件、持っとるんでしょ', '今日はよう視えるわ',
  'このメガネ、伊達じゃないで', 'ひげは関係ないけどね', 'ほんじゃ、やろまい',
  'なんか視えてきたかも', 'ちょー調子ええわ、今日', 'ええ顔しとるね'
];
var lineIdx = 0;
var speechTimer = 0;

function okudaSpeak(line, face) {
  var sp = $('introSpeech');
  sp.textContent = line;
  sp.classList.add('on');
  setFace(face);
  clearTimeout(speechTimer);
  speechTimer = setTimeout(function () {
    sp.classList.remove('on');
    setFace('normal');
  }, 2200);
}

function pokeOkuda() {
  var faces = ['grin', 'surprise', 'smile', 'warm', 'think'];
  okudaSpeak(OKUDA_LINES[lineIdx % OKUDA_LINES.length], faces[lineIdx % faces.length]);
  lineIdx++;
}

/* --- 起動 --- */

mountGenie($('genieIntro'));
mountGenie($('geniePref'));
mountGenie($('genie'));
mountGenie($('genieDivine'));
mountGenie($('genieResult'));
setFace('normal');

$('introCount').textContent = Math.floor(P.length / 100) * 100;

$('genieIntro').addEventListener('click', pokeOkuda);
$('genieIntro').addEventListener('mouseenter', function () {
  if (!$('introSpeech').classList.contains('on')) pokeOkuda();
});

$('btnStart').onclick = function () {
  A = {};
  pickedRegion = null;
  $('introSpeech').classList.remove('on');
  renderRegion();
  if (reduceMotion) return;
  ['geniePref', 'genie'].forEach(function (id) {
    var g = $(id);
    g.classList.remove('arrive');
    void g.offsetWidth;
    g.classList.add('arrive');
  });
};

// リアクション中に画面をさわったら、待たずに次へ
$('screen-quiz').addEventListener('click', function (e) {
  if (busy && !e.target.closest('.btn')) finishReaction();
});

$('btnAgain').onclick = function () { A = {}; shown = 0; show('screen-intro'); setFace('normal'); };
$('btnMore').onclick = function () { renderResult(); };
$('btnPast').onclick = showPast;

$('openTerms').onclick = function () { show('screen-terms'); };
$('termsBack').onclick = function () { show(result ? 'screen-result' : 'screen-intro'); };

// 最初のひとこと
setTimeout(function () {
  if ($('screen-intro').classList.contains('is-on')) okudaSpeak('お、来たね', 'grin');
}, 900);


/* ====================================================================
   7. 結果をシェアする（インスタのストーリーズ向けの画像をつくる）
==================================================================== */
(function share() {
  var W = 1080, H = 1920;
  var PAPER = '#f7f2e6', SUMI = '#241f1c', HADA = '#f2866f', KI = '#ffd84d', SORA = '#cbe7f4';
  var DISP = '"Zen Kurenaido", serif';
  var BODY = '"Zen Maru Gothic", sans-serif';

  // GENIE をそのまま画像に起こす
  function genieImage(face, cb) {
    var box = document.createElement('div');
    box.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 348" width="560" height="696">' +
      '<style>.face-layer{opacity:0}.face-layer.on{opacity:1}</style>' + GENIE + '</svg>';
    var svg = box.firstChild;
    var f = FACES[face] || FACES.normal;
    ['eyesOpen', 'eyesSmile', 'eyesShut', 'eyesWide'].forEach(function (k) {
      var n = svg.querySelector('#' + k); if (n) n.classList.toggle('on', k === f.eyes);
    });
    ['mNormal', 'mThink', 'mFlat', 'mSmile', 'mGrin', 'mOh'].forEach(function (k) {
      var n = svg.querySelector('#' + k); if (n) n.classList.toggle('on', k === f.mouth);
    });
    var b = svg.querySelector('#gBrows'); if (b) b.setAttribute('transform', 'translate(0 ' + f.brow + ')');
    var p = svg.querySelector('#pupils'); if (p) p.setAttribute('transform', 'translate(0 0)');
    var img = new Image();
    img.onload = function () { cb(img); };
    img.onerror = function () { cb(null); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
  }

  function wrap(ctx, text, maxW, maxLines) {
    var out = [], line = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ctx.measureText(line + ch).width > maxW && line) {
        out.push(line); line = ch;
        if (out.length === maxLines - 1) {
          var rest = text.slice(i);
          if (ctx.measureText(rest).width <= maxW) { out.push(rest); return out; }
          while (rest.length && ctx.measureText(rest + '…').width > maxW) rest = rest.slice(0, -1);
          out.push(rest + '…');
          return out;
        }
      } else { line += ch; }
    }
    if (line) out.push(line);
    return out.slice(0, maxLines);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw(top, done) {
    var cv = $('shareCanvas'), ctx = cv.getContext('2d');
    var x = top.x;

    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);

    // 紙の粒。上下の端だけに散らして、まん中は空けておく
    var seed = 11;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var COLS_ = ['rgba(127,195,227,.5)', 'rgba(242,134,111,.45)', 'rgba(255,216,77,.6)'];
    var corners = [[90, 90], [W - 90, 90], [90, H - 90], [W - 90, H - 90]];
    for (var i = 0; i < 28; i++) {
      var c = corners[i % 4];
      ctx.fillStyle = COLS_[i % 3];
      ctx.beginPath();
      ctx.arc(c[0] + (rnd() - 0.5) * 230, c[1] + (rnd() - 0.5) * 170, 4 + rnd() * 9, 0, 6.2832);
      ctx.fill();
    }

    ctx.strokeStyle = SUMI; ctx.lineWidth = 7; ctx.lineCap = 'round';
    roundRect(ctx, 46, 46, W - 92, H - 92, 48); ctx.stroke();

    ctx.textAlign = 'center';

    // ヘッダ
    ctx.fillStyle = SUMI;
    ctx.font = '40px ' + DISP;
    ctx.fillText('さ か さ マ ッ チ メ ー カ ー', W / 2, 164);
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(W / 2 - 54, 202); ctx.lineTo(W / 2 + 54, 202); ctx.stroke();

    // オクダーマン
    var gw = 380, gh = gw * 348 / 280;
    if (top.genie) ctx.drawImage(top.genie, W / 2 - gw / 2, 236, gw, gh);
    ctx.fillStyle = '#6e655d';
    ctx.font = '30px ' + BODY;
    ctx.fillText('占い師オクダーマン', W / 2, 700);

    // リード
    ctx.fillStyle = '#5b534c';
    ctx.font = '44px ' + DISP;
    ctx.fillText('わたしの物件と相性がよさそうなのは', W / 2, 790);

    // 名前（黄色のマーカーを敷く）
    ctx.font = '104px ' + DISP;
    var nm = (x.n || '（お名前非公開）').replace(/\s*[（(][^）)]*[）)]\s*$/, '');
    while (ctx.measureText(nm).width > W - 200 && nm.length > 2) nm = nm.slice(0, -1);
    var nw = ctx.measureText(nm).width;
    ctx.fillStyle = KI;
    ctx.fillRect(W / 2 - nw / 2 - 16, 828, nw + 32, 62);
    ctx.fillStyle = SUMI;
    ctx.fillText(nm, W / 2, 890);

    var y = 952;
    if (x.r) {
      ctx.fillStyle = '#5b534c';
      ctx.font = '34px ' + BODY;
      ctx.fillText(wrap(ctx, x.r, W - 240, 1)[0], W / 2, y);
      y += 46;
    }

    // やりたいこと（枠で囲む）
    ctx.font = '46px ' + DISP;
    var lines = wrap(ctx, x.t || '', W - 260, 3);
    var boxH = lines.length * 70 + 72;
    ctx.strokeStyle = SUMI; ctx.lineWidth = 5;
    roundRect(ctx, 100, y + 14, W - 200, boxH, 32); ctx.stroke();
    ctx.fillStyle = HADA;
    ctx.font = '26px ' + BODY;
    ctx.fillText('やりたいこと', W / 2, y + 62);
    ctx.fillStyle = SUMI;
    ctx.font = '46px ' + DISP;
    var ty = y + 128;
    lines.forEach(function (ln) { ctx.fillText(ln, W / 2, ty); ty += 70; });
    y = y + boxH + 92;

    // 相性メーター
    ctx.fillStyle = SUMI;
    ctx.font = '36px ' + DISP;
    ctx.textAlign = 'left';
    ctx.fillText('相性', 120, y);
    ctx.textAlign = 'right';
    ctx.font = 'bold 76px "Lato", sans-serif';
    ctx.fillText(top.pct + '%', W - 120, y + 12);
    ctx.textAlign = 'center';
    var bx = 120, bw = W - 240, by = y + 40, bh = 26;
    ctx.fillStyle = PAPER;
    roundRect(ctx, bx, by, bw, bh, 13); ctx.fill();
    ctx.fillStyle = KI;
    roundRect(ctx, bx, by, Math.max(bw * top.pct / 100, 36), bh, 13); ctx.fill();
    ctx.strokeStyle = SUMI; ctx.lineWidth = 5;
    roundRect(ctx, bx, by, bw, bh, 13); ctx.stroke();

    // フッター
    ctx.strokeStyle = 'rgba(36,31,28,.25)'; ctx.lineWidth = 4;
    ctx.setLineDash([12, 14]);
    ctx.beginPath(); ctx.moveTo(130, H - 330); ctx.lineTo(W - 130, H - 330); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = SUMI;
    ctx.font = '46px ' + DISP;
    ctx.fillText('あなたの物件は、誰と合う？', W / 2, H - 246);
    ctx.fillStyle = '#5b534c';
    ctx.font = '30px ' + BODY;
    ctx.fillText('さかさま不動産に掲載されている ' + P.length + ' 人から占いました', W / 2, H - 190);

    ctx.font = '48px ' + DISP;
    var tag = '@sakasama_fudosan';
    var tw = ctx.measureText(tag).width;
    ctx.fillStyle = KI;
    ctx.fillRect(W / 2 - tw / 2 - 14, H - 148, tw + 28, 52);
    ctx.fillStyle = SUMI;
    ctx.fillText(tag, W / 2, H - 108);

    done(cv);
  }

  function openShare() {
    if (!result || !result.pool.length) return;
    var r = result.pool[0];
    var pct = Math.max(46, Math.min(97, Math.round(40 + (r.s / MAX_SCORE) * 58)));
    var sheet = $('shareSheet');
    sheet.hidden = false;
    document.body.style.overflow = 'hidden';

    var go = function () {
      genieImage('grin', function (gimg) {
        draw({ x: r.x, pct: pct, genie: gimg }, function (cv) {
          var url = cv.toDataURL('image/png');
          $('shareImg').src = url;
          if (navigator.canShare && cv.toBlob) {
            cv.toBlob(function (blob) {
              if (!blob) return;
              try {
                var file = new File([blob], 'sakasa-matchmaker.png', { type: 'image/png' });
                if (navigator.canShare({ files: [file] })) {
                  var b = $('btnShareNative');
                  b.hidden = false;
                  b.onclick = function () {
                    navigator.share({ files: [file], text: 'さかさマッチメーカーで占ってみた @sakasama_fudosan' })
                      .catch(function () {});
                  };
                }
              } catch (e) { /* 共有できない環境 */ }
            }, 'image/png');
          }
        });
      });
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  }

  function closeShare() {
    $('shareSheet').hidden = true;
    document.body.style.overflow = '';
  }

  $('btnShare').onclick = openShare;
  $('btnShareTop').onclick = openShare;
  $('shareClose').onclick = closeShare;

  // 保存がきかない端末向けに、画像だけの画面を出してスクショしてもらう
  $('btnShot').onclick = function () {
    var src = $('shareImg').src;
    if (!src) return;
    $('shotImg').src = src;
    $('shotView').hidden = false;
    var h = $('shotHint');
    h.classList.remove('fade');
    setTimeout(function () { h.classList.add('fade'); }, 1800);
  };
  $('shotView').onclick = function () { $('shotView').hidden = true; };
  addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('shotView').hidden) $('shotView').hidden = true;
  });
  $('shareSheet').addEventListener('click', function (e) { if (e.target === $('shareSheet')) closeShare(); });
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('shareSheet').hidden) closeShare(); });
  $('btnMention').onclick = function () { copyText('@sakasama_fudosan'); };
})();

})();

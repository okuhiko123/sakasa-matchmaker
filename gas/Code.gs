/**
 * さかさマッチメーカー 記録用スクリプト
 *
 * 占いの結果を、このスクリプトを置いたスプレッドシートに1行ずつ書き足します。
 * 取り扱うのは「どんな条件で占って、誰が出たか」だけです。
 * 氏名・連絡先・住所・IPアドレス・端末の識別子は受け取りません。
 *
 * 使い方は同じフォルダの README.md を見てください。
 */

// ▼ 管理画面で入力する合言葉。いくつ並べてもよい（どれでも入れる）
var ADMIN_KEYS = ['change-me'];

var SHEET_NAME = 'log';

var HEADERS = [
  '日時', 'ニックネーム', '都道府県', '市町村',
  '建物', '広さ', '家賃', '改装', '飲食', '住む', 'にぎわい', '売却', 'どんな人に',
  '結果（名前と相性）', '結果（slug）', '画面'
];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

/** 念のため、こちら側でも個人を特定しうる文字列を落とす */
function scrub_(v) {
  return String(v == null ? '' : v)
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '')
    .replace(/0\d{1,4}[-(]?\d{1,4}[-)]?\d{3,4}/g, '')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 12);
}

function doPost(e) {
  try {
    var b = JSON.parse(e.postData.contents);
    if (!b || b.v !== 1 || !b.pref) return text_('ng');

    var top = Array.isArray(b.top) ? b.top.slice(0, 5) : [];
    sheet_().appendRow([
      new Date(),
      scrub_(b.nick),
      String(b.pref).slice(0, 10),
      String(b.city || '').slice(0, 20),
      b.bldg || '', b.size || '', b.rent || '', b.renov || '', b.fire || '',
      b.live || '', b.lively || '', b.sell || '', b.wish || '',
      top.map(function (t) { return t.n + '(' + t.p + '%)'; }).join(' / '),
      top.map(function (t) { return t.s; }).join(' / '),
      b.dev === 'pc' ? 'パソコン' : 'スマホ'
    ]);
    return text_('ok');
  } catch (err) {
    return text_('ng');
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  var cb = p.callback;

  if (ADMIN_KEYS.indexOf(p.key) < 0) {
    return jsonp_(cb, { ok: false, error: 'key' });
  }

  var sh = sheet_();
  var last = sh.getLastRow();
  if (last < 2) return jsonp_(cb, { ok: true, rows: [] });

  var values = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var rows = values.map(function (r) {
    return {
      t: (r[0] instanceof Date) ? r[0].toISOString() : String(r[0]),
      nick: r[1], pref: r[2], city: r[3],
      bldg: r[4], size: r[5], rent: r[6], renov: r[7], fire: r[8],
      live: r[9], lively: r[10], sell: r[11], wish: r[12],
      top: r[13], slugs: r[14], dev: r[15]
    };
  });
  return jsonp_(cb, { ok: true, rows: rows });
}

function text_(s) {
  return ContentService.createTextOutput(s).setMimeType(ContentService.MimeType.TEXT);
}

function jsonp_(cb, obj) {
  var json = JSON.stringify(obj);
  if (cb) {
    return ContentService
      .createTextOutput(cb + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

/* さかさマッチメーカー 設定 ------------------------------------------------
   記録の送り先。GAS（Google Apps Script）のウェブアプリURLを入れると、
   占いの結果が運営のスプレッドシートに記録されるようになります。
   空のままなら、どこにも送らずに動きます（占いは問題なく使えます）。
   作り方は gas/README.md を見てください。
--------------------------------------------------------------------------- */
window.SM_CONFIG = {
  logEndpoint: 'https://script.google.com/macros/s/AKfycbxdXRmOHcJcTLy2b88ADvPWrCKAmK8W742ylS6NEABUCRDfDecgZp4qOyW0mzBcuZql/exec'
};

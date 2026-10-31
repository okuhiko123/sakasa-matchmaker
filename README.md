# さかさマッチメーカー

物件を持っている人がいくつかの質問に答えると、
[さかさま不動産](https://sakasama-fudosan.com/) に掲載されている人のなかから
相性のよさそうな人を、占い師オクダーマンが紹介します。

**https://okuhiko123.github.io/sakasa-matchmaker/**

## これは何でできているか

ライブラリは使っていません。静的ファイルだけです。

| ファイル | 中身 |
|---|---|
| `index.html` | 画面の骨格 |
| `app.css` | 見た目のすべて |
| `app.js` | オクダーマンのSVG・相性の計算・画面の進行・シェア画像 |
| `data.js` | 掲載者463人ぶんの条件（募集中239／募集終了224） |
| `muni.js` | 都道府県 → 市区町村（総務省の全国地方公共団体コード） |
| `img/sheet-*.webp` | 掲載者の写真。13枚のスプライトシートにまとめてある |
| `config.js` | 回答の記録先（設定済み。空にすれば記録しない） |
| `admin.html` | 回答の集計を見る画面。合言葉が要る |
| `gas/` | 記録先のGoogle Apps Scriptと、その手順書 |

占いの計算はブラウザの中だけで行います。
そのうえで、**選んだ条件と結果だけ**を集計用にスプレッドシートへ記録しています（氏名・連絡先・IP・端末の識別子は扱いません）。
しくみは [gas/README.md](gas/README.md)。集計は [admin.html](https://okuhiko123.github.io/sakasa-matchmaker/admin.html) で見られます（合言葉が要ります。合言葉は `_secret/admin-key.txt`、gitには入れていません）。

## 中身を新しくする

掲載者が増えたり、募集状況が変わったら、この2つを順に。

```bash
./build/fetch.sh          # さかさま不動産から取得（数分かかる）
python3 build/build.py    # data.js / muni.js / img/*.webp を作り直す
git add -A && git commit -m "データ更新" && git push
```

push から1〜2分で公開ページに反映されます。詳しい仕組みは [build/README.md](build/README.md)。

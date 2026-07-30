# English Quest

中学生向けに、中学1年から3年までの英文法と英単語をクエスト形式で練習するWebアプリです。
HTML・CSS・JavaScriptだけで動作し、ビルド作業やサーバー側のプログラムはありません。

## 起動方法

`fetch()`で問題データを読むため、`index.html`を直接ダブルクリックするのではなく、ローカルWebサーバー経由で開いてください。

Visual Studio CodeのLive Serverなどを使い、表示されたURLへアクセスします。GitHub Pagesへ配置した場合もそのまま動作します。

Node.jsがある場合は、次のコマンドでも起動できます。

```sh
node tools/serve-local.mjs
```

## 主なファイル

```text
english-study-web/
├─ index.html                 3画面のHTML構造
├─ settings.html              設定ページ
├─ question-manager.html      問題管理ページ
├─ css/
│  └─ style.css              デザインとレスポンシブ対応
├─ js/
│  └─ app.js                 出題、採点、画面切替、記録保存
├─ data/
│  ├─ questions.json         文法単元・問題・単語データ
│  ├─ quest-castle.png       トップ画面の背景
│  ├─ quest-heroes.png       メインキャラクター画像
│  └─ assets/                ロゴ、背景、正誤表示などの画像
├─ docs/
│  ├─ SOURCE_GUIDE.md        ソースコードの詳しい解説
│  └─ question-expansion-spec.html
│                              問題拡充のHTML仕様書
└─ tools/
   ├─ expand-full-curriculum.mjs
   │                           中1～中3の全範囲データを生成
   ├─ validate-question-data.mjs
   │                           問題データの形式を検証
   ├─ serve-local.mjs         ローカル確認用サーバー
   └─ extract-web-assets.ps1  元画像から素材を切り出す補助スクリプト
```

ルート直下の空ファイル `app.js` と `style.css` は現在使われていません。実際に読み込まれるのは `js/app.js` と `css/style.css` です。

## 問題・単語を追加する

設定画面の「問題管理」から、文法単元・問題・単語ステップ・単語を編集できます。
データを直接編集する場合、文法は `grammarUnits`、単語は `vocabularyUnits` に追加します。
`correctIndex` は0始まりで、最初の選択肢が正解なら `0`、2番目なら `1` です。

初期データには、文法37単元・758問、単語5ステップ・1,654語を登録しています。
全範囲の初期データを作り直す場合は `node tools/expand-full-curriculum.mjs`、形式を検証する場合は `node tools/validate-question-data.mjs` を実行します。

```json
{
  "question": "問題文",
  "hint": "回答のヒント",
  "choices": ["選択肢1", "選択肢2"],
  "correctIndex": 0,
  "answer": "正解の説明",
  "explanation": "詳しい解説",
  "point": "覚え方のポイント"
}
```

詳しい処理の流れ、保存データ、CSSの構成は [docs/SOURCE_GUIDE.md](docs/SOURCE_GUIDE.md) を参照してください。

## 問題管理ページ

ゲーム画面右上の歯車から「設定」へ進み、「問題管理」を開きます。

問題管理ページでは次の操作ができます。

- カテゴリの追加・編集・削除
- 問題の追加・編集・削除
- 単語ステップと単語の追加・編集・削除
- 学年、表示順、1回の出題数の設定
- ブラウザ内への下書き保存
- 公開中の `data/questions.json` の再読込
- JSONファイルの読込
- 編集済み `questions.json` のダウンロード

GitHub Pagesは静的サイトなので、管理ページから公開中のファイルを直接更新することはできません。ダウンロードした `questions.json` で `data/questions.json` を置き換え、Gitへコミット・pushすると公開内容へ反映されます。

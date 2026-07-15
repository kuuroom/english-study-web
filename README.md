# English Quest

中学生向けに、be動詞と一般動詞の使い分けをクエスト形式で練習するWebアプリです。
HTML・CSS・JavaScriptだけで動作し、ビルド作業やサーバー側のプログラムはありません。

## 起動方法

`fetch()`で問題データを読むため、`index.html`を直接ダブルクリックするのではなく、ローカルWebサーバー経由で開いてください。

Visual Studio CodeのLive Serverなどを使い、表示されたURLへアクセスします。GitHub Pagesへ配置した場合もそのまま動作します。

## 主なファイル

```text
english-study-web/
├─ index.html                 3画面のHTML構造
├─ css/
│  └─ style.css              デザインとレスポンシブ対応
├─ js/
│  └─ app.js                 出題、採点、画面切替、記録保存
├─ data/
│  ├─ questions.json         カテゴリと問題データ
│  ├─ quest-castle.png       トップ画面の背景
│  ├─ quest-heroes.png       メインキャラクター画像
│  └─ assets/                ロゴ、背景、正誤表示などの画像
├─ docs/
│  └─ SOURCE_GUIDE.md        ソースコードの詳しい解説
└─ tools/
   └─ extract-web-assets.ps1  元画像から素材を切り出す補助スクリプト
```

ルート直下の空ファイル `app.js` と `style.css` は現在使われていません。実際に読み込まれるのは `js/app.js` と `css/style.css` です。

## 問題を追加する

`data/questions.json` の `categories` 内へカテゴリまたは問題を追加します。`correctIndex` は0始まりで、最初の選択肢が正解なら `0`、2番目なら `1` です。

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

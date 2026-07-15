# 英語文法トレーニング

中学生向けの、be動詞と一般動詞の使い分け練習アプリです。

## ファイル構成

- `index.html`：画面
- `css/style.css`：見た目
- `js/app.js`：クイズ処理と学習記録
- `data/questions.json`：問題データ

## 問題を追加する方法

`data/questions.json` の `categories` 内に、問題またはカテゴリを追加します。

各問題は次の形式です。

```json
{
  "question": "問題文",
  "hint": "ヒント",
  "choices": ["選択肢1", "選択肢2"],
  "correctIndex": 0,
  "answer": "正解",
  "explanation": "解説",
  "point": "覚えるポイント"
}
```

`correctIndex` は、最初の選択肢が正解なら `0`、2番目なら `1` です。

## 公開

GitHub Pages の公開元を次のように設定します。

- Branch: `main`
- Folder: `/ (root)`

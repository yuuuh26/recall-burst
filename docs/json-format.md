# JSONインポート

AI追加用の最小例：

```json
{
  "format": "recall-burst-ai",
  "schemaVersion": 1,
  "decks": [{"id": "my-deck", "name": "職場で覚えること"}],
  "questions": [{
    "id": "my-q-001",
    "deckId": "my-deck",
    "prompt": "架空の部署",
    "answer": "正しい担当者",
    "promptLang": "ja-JP",
    "answerLang": "ja-JP",
    "choices": ["誤答A", "誤答B", "誤答C"],
    "note": "記憶のヒント",
    "tags": ["人名"],
    "enabled": true
  }]
}
```

- `id`は必須。一意の文字列。既存問題の更新には同じidを使います。
- `deckId`は同じJSON内のdecksのidを参照します。
- 正解はanswer。choicesに含めなくても構いません。正解と重複する候補は4択生成時に除外します。
- 候補が少ない時はジャンル内の有効な他問題から補完。不足時は開始前に通知しRecallへ切り替えできます。
- 逆方向の4択は問題文を選択肢にするため、異なる問題文を4つ以上登録してください。
- 読み上げ言語：`promptLang`は問題文、`answerLang`は正解（逆方向で使用）。`ja-JP`、`en-US`、`zh-CN`、`fr-FR`などの言語タグ、または`auto`。省略も自動判定です。漢字だけの中国語・英語以外のアルファベットは明示してください。旧JSONは引き続き読み込めます。
- 任意項目：promptLang / answerLang / note / enabled / tags / difficulty / category / createdAt / updatedAt。
- 保存日時の省略時には取り込み時刻を補完します。
- 全体20MBまで。問題・ジャンル等の各配列10万項目まで。

完全バックアップはアプリの「完全バックアップ」から出力します。`format: recall-burst-backup`を使い、decks / questions / questionStats / sessions / settings / characters / appMetaをすべて含む必要があります。

バックアップJSONをAI編集用に手作業で変換するより、「AI編集用JSON」の出力を使ってください。履歴や成績を誤って書き換えるのを避けられます。

ジャンルに任意の `ranges`（`id`、`name`、任意の `tag`）を追加すると、ホームに出題範囲が表示されます。`tag` は問題の `tags` で絞り込みます。誤答候補はジャンル全体から選びます。

TOEIC移植問題の `sourceApp` / `sourceData` は元アプリの全項目を保持しています。AI編集・完全復元でも保持され、同義語・除外候補の判定に使用します。元データを維持して編集してください。

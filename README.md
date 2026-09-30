# RECALL BURST v1.0.0

思い出すたび、記憶がバースト。小春のリアクション、COMBO、RECALL FEVERを楽しみながら繰り返す暗記ゲーム。

## 使い方

1. ジャンルを選び、START BURST。
2. 4択で回答。正解速度でGOOD / GREAT / PERFECT。10連続正解でFEVER。
3. 「問題」でジャンル・問題を追加。「設定」でRecall、逆方向、音、振動、演出強度を変更。
4. 端末を変える前に「完全バックアップ」を保存。JSONは読み込み確認後に追加・更新される。

初期20問は、架空チーム8問と英単語12問。人物名・チーム名はすべて架空です。

## 公開

対象リポジトリは `yuuuh26/recall-burst`。GitHub Settings → Pages → Sourceを **Deploy from a branch**、Branchを **main / (root)** に設定して公開します。ビルドは不要です。

公開先： https://yuuuh26.github.io/recall-burst/

別のリポジトリ名で使う際は `manifest.webmanifest` のid / scope / start_urlも変更してください。

## PWA・オフライン

Android Chromeの「ホーム画面に追加」からインストール。初回オンライン読込とService Workerの準備完了後、ゲーム・画像・合成音源をオフライン利用できます。

- IndexedDB: `yuu-recall-burst`
- Service Worker scope: `/recall-burst/`
- Cache: `yuu-recall-burst-v1.0.0-r2`
- 他PWAのキャッシュは削除しません。
- 更新時はapp.jsのバージョン表示を決めるconfig.js、package.json、sw.jsのVERSIONを更新。待機中のSWは全タブを閉じて次回起動した際に切り替わります。

## キャラクター

アプリ内の人物キャラクターはAI生成による架空のキャラクターです。実在の人物とは関係ありません。

提供された小春の基準画像を使用。v1.0は同一画像を各状態へ割り当て、CSS・Canvasでリアクションを補っています。別表情へ差し替えるには `assets/avatars/koharu/{neutral,smile,happy,delight,fever,miss,clear}.webp` を置換してください。画像変更時にもSWのVERSIONを更新します。キャラクター定義は `js/characters.js` に分離しています。

## 学習とゲーム

- EASY 8秒 / NORMAL 6秒 / HARD 4秒 / EXPERT 3秒。
- 制限時間35%以内でPERFECT、70%以内でGREAT、時間内でGOOD。時間切れ・誤答でMISS。
- 基本点100 / 80 / 50点、コンボ加点は1問最大50点。
- 最近のMISS → 低正答率 → 遅い回答 → 長期間未出題 → NEW → 習得済みの順。同一優先度のカードはシャッフル。MASTEREDも通常プレイの対象。
- MISSは3〜8問を挟んで再出題。短いセッションの末尾では他の問題を挟みます。無限再出題防止のため1カード1セッション1回の追加再出題まで。1問しかないジャンルでは他のカードを挟めないため末尾に1回再出題。
- Recallでは答えを表示するまでの速度で判定。表示後はタイマーを止め、自己判定します。
- 通常方向と逆方向の習熟度を別々に記録。各回答時に成績保存、終了時にセッション履歴保存。ページを突然閉じた場合も保存済み問題成績は残り、セッション履歴は終了した分だけです。
- 音源はWeb Audioで合成。FOCUS / RUSH / BURSTの3トラック、7種のSE、FEVER時の追加音。音源ファイルや外部配信は不要。
- エフェクトは弱 / 標準 / 強 / MAX。Canvas上限240粒、DPR上限2。reduced motionではフラッシュ・揺れ・ジャンプを抑制。

## データ・バックアップ

JSON形式の詳細は `docs/json-format.md`。

バックアップには全ジャンル・問題・問題成績・履歴・設定・characters・appMeta・schemaVersion・exportedAtを含みます。AI編集用JSONにはジャンルと問題だけを含めます。

インポートは形式・ID重複・参照先・数値・設定を検証した後にプレビュー。初期動作はIDによる追加・更新で、JSONにない既存項目を保持。完全バックアップだけ、明示的なチェックと確認で置き換え可能です。操作前の全データも自動ダウンロードします。保存はIndexedDBの単一トランザクションで、失敗時は直前の保存データを保ちます。複数タブの更新はWeb Locksで直列化します。

## プライバシー

登録した問題や成績はこの端末のIndexedDBだけに保存されます。外部AI API・自動同期・Google Analytics・分析SDKは使用しません。AIへJSONを渡す操作はユーザーが手動で行います。

noindex,nofollowを指定。robots.txtも同梱していますが、GitHub Pagesプロジェクト配下のrobots.txtはドメイン直下の規則を置き換えるものではありません。公開コード・画像は誰でも閲覧可能で、noindexはアクセス制限ではありません。

## ローカル実行・確認

```sh
npm test
python3 -m http.server 8000 --directory ..
```

`http://localhost:8000/recall-burst/` を開きます。index.htmlのファイル直接実行はES Modules / IndexedDB / SWの検証対象外です。npm依存パッケージはありません。

確認結果と未確認事項は `docs/verification.md` を参照してください。

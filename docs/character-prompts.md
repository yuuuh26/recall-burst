# 小春の追加画像（v1.1.0）

方式：内蔵imagegenによるidentity-preserve編集。入力は提供された架空の小春の基準画像。元ファイルはそのまま保持。

共通指示：同じ顔・顔の比率・茶色の細い眼鏡・茶色のウェーブ髪・水色のブラウス・顔の位置と大きさ・駅のぼけた背景・自然な光を保つ。1枚の写真、文字なし。

- happy.webp：口を少し開いた明るい自然な笑顔。頬と目も喜ぶ。
- delight.webp：歯が見える大きな笑顔、上がった頬、喜んで細まる目。軽い笑顔より明確に大喜び。
- cheer.webp：明るく励ます笑顔。両手を軽く握り、頬・あごの横へ上げる「がんばって！」のポーズ。顔は隠さず、頭と肩を表示するゲームの枠に手も入る位置。

保存先：assets/avatars/koharu/。生成PNGを幅768px、品質84のWebPに変換。fever.webpとclear.webpはdelight.webpを共用。neutral.webp、smile.webp、miss.webpは元の基準画像のまま。

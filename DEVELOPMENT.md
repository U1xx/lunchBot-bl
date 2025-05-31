# 開発環境セットアップ

## 1. リポジトリのクローン

\`\`\`bash
git clone https://github.com/yourusername/lunch-slack-bot.git
cd lunch-slack-bot
\`\`\`

## 2. 依存関係のインストール

\`\`\`bash
npm install
# または
yarn install
\`\`\`

## 3. 環境変数の設定

`.env.local.example`をコピーして`.env.local`を作成：

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

`.env.local`ファイルを編集して実際の値を設定：

\`\`\`env
GOOGLE_SHEETS_API_KEY=your_actual_api_key
GOOGLE_SHEET_ID=your_actual_sheet_id
SLACK_BOT_TOKEN=xoxb-your_actual_token
SLACK_CHANNEL_ID=C1234567890
\`\`\`

## 4. 開発サーバーの起動

\`\`\`bash
npm run dev
# または
yarn dev
\`\`\`

## 5. 管理画面へのアクセス

ブラウザで以下のURLにアクセス：
\`\`\`
http://localhost:3000
\`\`\`

## 6. API エンドポイントのテスト

### スプレッドシート接続テスト
\`\`\`bash
curl http://localhost:3000/api/test-sheets
\`\`\`

### ランチ選択テスト
\`\`\`bash
curl http://localhost:3000/api/lunch-picker
\`\`\`

### 定期実行テスト
\`\`\`bash
curl http://localhost:3000/api/cron/lunch

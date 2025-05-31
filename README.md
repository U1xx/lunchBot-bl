# ランチ候補選択Slack Bot

Google Driveのスプレッドシートからランダムにお店を選んでSlack Botでランチ候補を告知するシステムです。

## 機能

- Google Sheetsからお店一覧を取得
- ランダムに1つのお店を自動選択
- Slackチャンネルに通知
- 定期実行（平日11時）
- 手動実行（管理画面から）

## セットアップ

### 1. 環境変数の設定

以下の環境変数を設定してください：

- `GOOGLE_SHEETS_API_KEY`: Google Sheets APIキー
- `SLACK_BOT_TOKEN`: Slack Botトークン（xoxb-で始まる）
- `SLACK_CHANNEL_ID`: 通知を送信するSlackチャンネルID
- `GOOGLE_SHEET_ID`: スプレッドシートのID

### 2. Google Sheets APIの設定

1. Google Cloud Consoleで新しいプロジェクトを作成
2. Google Sheets APIを有効化
3. APIキーを作成（IPアドレス制限を設定推奨）

### 3. Slack Botの設定

1. Slack APIでアプリを作成
2. Bot Tokenを取得
3. 必要な権限を設定：
   - `chat:write`
   - `chat:write.public`

### 4. スプレッドシートの形式

スプレッドシートは以下の列を含む必要があります：

| A列（name） | B列（genre） | C列（address） | D列（url） |
|-------------|--------------|----------------|------------|
| お店の名前   | ジャンル      | 住所           | URL        |

### 5. デプロイ

#### Cloudflare Pagesの場合

1. GitHubリポジトリをCloudflare Pagesに接続
2. 環境変数を設定
3. 自動デプロイ

#### Vercelの場合

1. GitHubリポジトリをVercelに接続
2. 環境変数を設定
3. 自動デプロイ

## 使い方

### 手動実行

1. デプロイされたアプリの管理画面にアクセス
2. 「ランチを選ぶ」ボタンをクリック

### API経由

\`\`\`bash
# 手動実行
curl -X POST https://your-domain.com/api/cron/lunch

# 定期実行確認
curl https://your-domain.com/api/cron/lunch
\`\`\`

### 定期実行

- 平日の11:00に自動実行
- Cloudflare Workers Cron Triggersを使用

## トラブルシューティング

### よくある問題

1. **Google Sheets APIエラー**
   - APIキーが正しく設定されているか確認
   - スプレッドシートが公開されているか確認

2. **Slack送信エラー**
   - Bot Tokenが正しく設定されているか確認
   - チャンネルIDが正しいか確認
   - Botがチャンネルに招待されているか確認

3. **スプレッドシートが空**
   - スプレッドシートにデータが入っているか確認
   - 列の形式が正しいか確認

## ライセンス

MIT License

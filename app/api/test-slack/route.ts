import { NextResponse } from "next/server"
import { WebClient } from "@slack/web-api"

export async function GET() {
  try {
    const slack = new WebClient(process.env.SLACK_BOT_TOKEN)

    // Bot情報を取得してトークンの有効性を確認
    const authTest = await slack.auth.test()

    // チャンネル情報を取得
    const channelInfo = await slack.conversations.info({
      channel: process.env.SLACK_CHANNEL_ID!,
    })

    return NextResponse.json({
      success: true,
      message: "Slack接続テスト成功",
      botInfo: {
        user: authTest.user,
        team: authTest.team,
        url: authTest.url,
      },
      channelInfo: {
        name: channelInfo.channel?.name,
        id: channelInfo.channel?.id,
        isMember: channelInfo.channel?.is_member,
      },
    })
  } catch (error: any) {
    console.error("Slack test error:", error)

    let errorMessage = error.message
    let suggestions = []

    if (error.data?.error === "missing_scope") {
      errorMessage = "Slack Botに必要な権限が不足しています"
      suggestions = [
        "Slack APIアプリの設定で 'chat:write' スコープを追加してください",
        "Slack APIアプリの設定で 'chat:write.public' スコープを追加してください",
        "スコープ追加後、ワークスペースに再インストールしてください",
        "新しいBot Tokenを環境変数に設定してください",
      ]
    } else if (error.data?.error === "invalid_auth") {
      errorMessage = "Slack Bot Tokenが無効です"
      suggestions = [
        "SLACK_BOT_TOKEN環境変数を確認してください",
        "トークンが 'xoxb-' で始まることを確認してください",
        "Slack APIアプリから正しいBot User OAuth Tokenをコピーしてください",
      ]
    } else if (error.data?.error === "channel_not_found") {
      errorMessage = "指定されたチャンネルが見つかりません"
      suggestions = [
        "SLACK_CHANNEL_ID環境変数を確認してください",
        "チャンネルIDが正しいことを確認してください",
        "Botがチャンネルに招待されていることを確認してください",
      ]
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        suggestions,
        originalError: error.data?.error || error.message,
      },
      { status: 500 },
    )
  }
}

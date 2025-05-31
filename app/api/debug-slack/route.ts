import { NextResponse } from "next/server"
import { WebClient } from "@slack/web-api"

export async function GET() {
  try {
    // 現在のトークンを表示（セキュリティのため一部のみ）
    const token = process.env.SLACK_BOT_TOKEN || ""
    const maskedToken = token.substring(0, 10) + "..." + token.substring(token.length - 5)

    // Slack APIクライアントを初期化
    const slack = new WebClient(token)

    // 詳細なデバッグ情報を取得
    let authTestResult
    let authError = null
    try {
      authTestResult = await slack.auth.test()
    } catch (error: any) {
      authError = {
        error: error.data?.error || error.message,
        needed: error.data?.needed,
        provided: error.data?.provided,
      }
    }

    // チャンネル情報の取得を試みる
    let channelInfo
    let channelError = null
    try {
      channelInfo = await slack.conversations.info({
        channel: process.env.SLACK_CHANNEL_ID!,
      })
    } catch (error: any) {
      channelError = {
        error: error.data?.error || error.message,
        needed: error.data?.needed,
        provided: error.data?.provided,
      }
    }

    // テストメッセージの送信を試みる
    let postMessageResult
    let postError = null
    try {
      postMessageResult = await slack.chat.postMessage({
        channel: process.env.SLACK_CHANNEL_ID!,
        text: "🔍 デバッグテストメッセージ",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*🔍 デバッグテストメッセージ*\nこれはSlack API接続テスト用のメッセージです。",
            },
          },
        ],
      })
    } catch (error: any) {
      postError = {
        error: error.data?.error || error.message,
        needed: error.data?.needed,
        provided: error.data?.provided,
      }
    }

    return NextResponse.json({
      tokenInfo: {
        prefix: token.substring(0, 5),
        length: token.length,
        maskedToken,
      },
      authTest: authError || authTestResult,
      channelInfo: channelError || {
        name: channelInfo?.channel?.name,
        is_member: channelInfo?.channel?.is_member,
      },
      postMessage: postError || {
        success: postMessageResult?.ok,
        ts: postMessageResult?.ts,
      },
      environmentVariables: {
        SLACK_BOT_TOKEN_SET: !!process.env.SLACK_BOT_TOKEN,
        SLACK_CHANNEL_ID_SET: !!process.env.SLACK_CHANNEL_ID,
        SLACK_CHANNEL_ID: process.env.SLACK_CHANNEL_ID,
      },
    })
  } catch (error: any) {
    console.error("Debug error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { WebClient } from "@slack/web-api"

export async function GET() {
  try {
    const slack = new WebClient(process.env.SLACK_BOT_TOKEN)

    // Botの基本情報を取得
    const authTest = await slack.auth.test()

    // Botが参加しているチャンネル一覧を取得
    const channels = await slack.conversations.list({
      types: "public_channel,private_channel",
      limit: 100,
    })

    // Botがメンバーになっているチャンネルのみフィルタ
    const botChannels = channels.channels?.filter((channel) => channel.is_member) || []

    return NextResponse.json({
      success: true,
      workspace: {
        name: authTest.team,
        id: authTest.team_id,
        url: authTest.url,
      },
      bot: {
        name: authTest.user,
        id: authTest.user_id,
      },
      channels: botChannels.map((channel) => ({
        id: channel.id,
        name: channel.name,
        is_private: channel.is_private,
        member_count: channel.num_members,
      })),
      currentChannelId: process.env.SLACK_CHANNEL_ID,
    })
  } catch (error: any) {
    console.error("Error listing workspaces:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        suggestion: "Slack Bot Tokenが正しく設定されているか確認してください",
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { getRestaurantList, pickRandomRestaurant } from "@/lib/google-sheets"
import { sendLunchRecommendation } from "@/lib/slack"

export async function POST(request: Request) {
  try {
    // Content-Typeを確認
    const contentType = request.headers.get("content-type")

    let payload
    if (contentType?.includes("application/json")) {
      // JSON形式の場合
      payload = await request.json()
    } else {
      // Form data形式の場合
      const formData = await request.formData()
      const payloadString = formData.get("payload") as string
      if (!payloadString) {
        return NextResponse.json({ error: "No payload found" }, { status: 400 })
      }
      payload = JSON.parse(payloadString)
    }

    console.log("Received payload:", JSON.stringify(payload, null, 2))

    // Slack URL verification (初回設定時)
    if (payload.type === "url_verification") {
      return NextResponse.json({ challenge: payload.challenge })
    }

    // インタラクティブ要素の処理
    if (payload.type === "block_actions") {
      const action = payload.actions?.[0]
      const actionId = action?.action_id
      const userId = payload.user?.id
      const userName = payload.user?.name

      console.log(`Action received: ${actionId} from user: ${userName}`)

      if (actionId === "lunch_reject") {
        try {
          // 新しいお店を選択
          const restaurants = await getRestaurantList()
          const selectedRestaurant = pickRandomRestaurant(restaurants)

          // Slackに新しい候補を送信
          await sendLunchRecommendation(selectedRestaurant)

          // 元のメッセージを更新（オプション）
          return NextResponse.json({
            response_type: "ephemeral",
            text: `${userName}さんが新しいお店を選択しました！新しい候補を送信しました。`,
            replace_original: false,
          })
        } catch (error: any) {
          console.error("Error selecting new restaurant:", error)
          return NextResponse.json({
            response_type: "ephemeral",
            text: "申し訳ありません。新しいお店の選択中にエラーが発生しました。",
          })
        }
      }

      if (actionId === "lunch_approve") {
        return NextResponse.json({
          response_type: "ephemeral",
          text: `${userName}さんがこのお店を気に入りました！👍`,
        })
      }

      // 未知のアクション
      return NextResponse.json({
        response_type: "ephemeral",
        text: "アクションを受け付けました。",
      })
    }

    // その他のイベント
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in slack-webhook:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 },
    )
  }
}

// GETメソッドも追加（テスト用）
export async function GET() {
  return NextResponse.json({
    message: "Slack Webhook endpoint is working",
    timestamp: new Date().toISOString(),
  })
}

import { NextResponse } from "next/server"
import { getRestaurantList, pickRandomRestaurant } from "@/lib/google-sheets"
import { sendLunchRecommendation } from "@/lib/slack"

export async function POST(request: Request) {
  try {
    console.log("=== Slack Webhook POST Request ===")
    console.log("Headers:", Object.fromEntries(request.headers.entries()))

    // Content-Typeを確認
    const contentType = request.headers.get("content-type") || ""
    console.log("Content-Type:", contentType)

    let payload

    // Slackは通常 application/x-www-form-urlencoded で送信
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData()
      const payloadString = formData.get("payload") as string

      if (!payloadString) {
        console.log("No payload found in form data")
        return NextResponse.json({ error: "No payload found" }, { status: 400 })
      }

      payload = JSON.parse(payloadString)
    } else if (contentType.includes("application/json")) {
      // JSON形式の場合
      payload = await request.json()
    } else {
      // テキストとして読み取って解析を試みる
      const body = await request.text()
      console.log("Raw body:", body)

      if (body.startsWith("payload=")) {
        const payloadString = decodeURIComponent(body.substring(8))
        payload = JSON.parse(payloadString)
      } else {
        try {
          payload = JSON.parse(body)
        } catch {
          console.log("Could not parse body as JSON")
          return NextResponse.json({ error: "Invalid payload format" }, { status: 400 })
        }
      }
    }

    console.log("Parsed payload:", JSON.stringify(payload, null, 2))

    // Slack URL verification (初回設定時)
    if (payload.type === "url_verification") {
      console.log("URL verification challenge:", payload.challenge)
      return NextResponse.json({ challenge: payload.challenge })
    }

    // インタラクティブ要素の処理
    if (payload.type === "block_actions") {
      const action = payload.actions?.[0]
      const actionId = action?.action_id
      const userId = payload.user?.id
      const userName = payload.user?.name

      console.log(`Action received: ${actionId} from user: ${userName} (${userId})`)

      if (actionId === "lunch_reject") {
        try {
          console.log("Processing lunch_reject action...")

          // 新しいお店を選択
          const restaurants = await getRestaurantList()
          const selectedRestaurant = pickRandomRestaurant(restaurants)

          console.log("Selected new restaurant:", selectedRestaurant.name)

          // Slackに新しい候補を送信
          await sendLunchRecommendation(selectedRestaurant)

          // 成功レスポンス
          return NextResponse.json({
            response_type: "in_channel",
            text: `${userName}さんが新しいお店を選択しました！新しい候補: ${selectedRestaurant.name}`,
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
        console.log("Processing lunch_approve action...")
        return NextResponse.json({
          response_type: "ephemeral",
          text: `${userName}さんがこのお店を気に入りました！👍`,
        })
      }

      // 未知のアクション
      console.log("Unknown action:", actionId)
      return NextResponse.json({
        response_type: "ephemeral",
        text: "アクションを受け付けました。",
      })
    }

    // その他のイベント
    console.log("Other event type:", payload.type)
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
    methods: ["GET", "POST"],
  })
}

// OPTIONSメソッドも追加（CORS対応）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

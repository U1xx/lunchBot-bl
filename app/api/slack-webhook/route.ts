import { NextResponse } from "next/server"
import { getRestaurantList, pickRandomRestaurant } from "@/lib/google-sheets"
import { sendLunchRecommendation } from "@/lib/slack"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const payload = JSON.parse(formData.get("payload") as string)

    const actionId = payload.actions?.[0]?.action_id

    // 既存のランチ拒否アクション
    if (actionId === "lunch_reject") {
      const restaurants = await getRestaurantList()
      const selectedRestaurant = pickRandomRestaurant(restaurants)
      await sendLunchRecommendation(selectedRestaurant)

      return NextResponse.json({ text: "新しいランチ候補を送信しました！" })
    }

    return NextResponse.json({ text: "アクションを受け付けました" })
  } catch (error: any) {
    console.error("Error in slack-webhook API:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

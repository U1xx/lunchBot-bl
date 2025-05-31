import { NextResponse } from "next/server"
import { getRestaurantList, pickRandomRestaurant } from "@/lib/google-sheets"
import { sendLunchRecommendation } from "@/lib/slack"

export async function GET() {
  try {
    // Google Sheetsからレストランリストを取得
    const restaurants = await getRestaurantList()

    // ランダムにレストランを選択
    const selectedRestaurant = pickRandomRestaurant(restaurants)

    // Slackにメッセージを送信
    await sendLunchRecommendation(selectedRestaurant)

    return NextResponse.json({
      success: true,
      message: "Lunch recommendation sent to Slack",
      restaurant: selectedRestaurant,
    })
  } catch (error: any) {
    console.error("Error in lunch-picker API:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getRestaurantList, pickRandomRestaurantManual } from "@/lib/google-sheets"
import { sendLunchRecommendation, sendMenuCollectionNotice } from "@/lib/slack"
import { createOrderSession } from "@/lib/orders"

export async function GET() {
  try {
    // Google Sheetsからレストランリストを取得
    const restaurants = await getRestaurantList()

    // ランダムにレストランを選択
    const selectedRestaurant = pickRandomRestaurantManual(restaurants)

    // 注文セッションを作成
    const orderSession = createOrderSession(selectedRestaurant)

    // Slackにメッセージを送信
    await sendLunchRecommendation(selectedRestaurant)

    // メニュー投稿の案内も送信
    setTimeout(async () => {
      await sendMenuCollectionNotice(selectedRestaurant)
    }, 2000) // 2秒後に送信

    return NextResponse.json({
      success: true,
      message: "Lunch recommendation sent to Slack",
      restaurant: selectedRestaurant,
      orderSession: {
        id: orderSession.id,
        isActive: orderSession.isActive,
      },
    })
  } catch (error: any) {
    console.error("Error in lunch-picker API:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

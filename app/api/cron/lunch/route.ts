import { NextResponse } from "next/server"
import { getRestaurantList, pickRandomRestaurant } from "@/lib/google-sheets"
import { sendLunchRecommendation } from "@/lib/slack"

// 定期実行用のエンドポイント（Cloudflare Workers Cron Triggersで使用）
export async function GET() {
  try {
    // 平日のランチタイム（11:00-12:00）のみ実行するチェック
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay() // 0=日曜日, 1=月曜日, ..., 6=土曜日

    // 平日（月-金）かつ11時台のみ実行
    if (day === 0 || day === 6 || hour !== 11) {
      return NextResponse.json({
        success: false,
        message: "ランチタイム外です（平日11時台のみ実行）",
        currentTime: now.toISOString(),
      })
    }

    // Google Sheetsからレストランリストを取得
    const restaurants = await getRestaurantList()

    // ランダムにレストランを選択
    const selectedRestaurant = pickRandomRestaurant(restaurants)

    // Slackにメッセージを送信
    await sendLunchRecommendation(selectedRestaurant)

    return NextResponse.json({
      success: true,
      message: "今日のランチ候補を自動選択してSlackに送信しました",
      restaurant: selectedRestaurant.name,
      time: now.toISOString(),
    })
  } catch (error: any) {
    console.error("Error in cron lunch API:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// 手動実行用（POST）
export async function POST() {
  try {
    // Google Sheetsからレストランリストを取得
    const restaurants = await getRestaurantList()

    // ランダムにレストランを選択
    const selectedRestaurant = pickRandomRestaurant(restaurants)

    // Slackにメッセージを送信
    await sendLunchRecommendation(selectedRestaurant)

    return NextResponse.json({
      success: true,
      message: "ランチ候補を手動選択してSlackに送信しました",
      restaurant: selectedRestaurant.name,
      time: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error in manual lunch selection:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { getRestaurantList, pickRandomRestaurant } from "@/lib/google-sheets"
import { sendLunchRecommendation } from "@/lib/slack"
import { isWeekday, getHolidayName } from "@/lib/holidays"

// 定期実行用のエンドポイント（Vercel Cron Jobsで使用）
export async function GET() {
  try {
    // 日本時間で現在時刻を取得
    const now = new Date()
    const japanTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }))
    const hour = japanTime.getHours()
    const minute = japanTime.getMinutes()

    console.log(`Cron job triggered at: ${japanTime.toISOString()} (Japan Time)`)
    console.log(`Hour: ${hour}, Minute: ${minute}`)

    // 平日かどうかをチェック
    if (!isWeekday(japanTime)) {
      const holidayName = getHolidayName(japanTime)
      const reason = holidayName ? `祝日（${holidayName}）` : "土日"

      return NextResponse.json({
        success: false,
        message: `今日は${reason}のため、ランチ選択をスキップします`,
        currentTime: japanTime.toISOString(),
        isWeekday: false,
        holidayName,
      })
    }

    // 9時台のみ実行（9:00-9:59）
    if (hour !== 9) {
      return NextResponse.json({
        success: false,
        message: `実行時間外です（平日9時台のみ実行、現在: ${hour}:${minute.toString().padStart(2, "0")}）`,
        currentTime: japanTime.toISOString(),
        isWeekday: true,
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
      time: japanTime.toISOString(),
      isWeekday: true,
    })
  } catch (error: any) {
    console.error("Error in cron lunch API:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// 手動実行用（POST）- 平日チェックをスキップ
export async function POST() {
  try {
    const japanTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }))

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
      time: japanTime.toISOString(),
      manual: true,
    })
  } catch (error: any) {
    console.error("Error in manual lunch selection:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

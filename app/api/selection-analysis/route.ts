import { NextResponse } from "next/server"
import { getDetailedSelectionAnalysis, addToHistoryForDate } from "@/lib/history"
import { getRestaurantList } from "@/lib/google-sheets"

export async function GET() {
  try {
    const analysis = getDetailedSelectionAnalysis()

    return NextResponse.json({
      success: true,
      analysis,
      message: "選択分析を取得しました",
    })
  } catch (error: any) {
    console.error("Error getting selection analysis:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// テスト用：過去の履歴を追加
export async function POST(request: Request) {
  try {
    const { action, testData } = await request.json()

    if (action === "addTestHistory") {
      // テスト用の履歴を追加
      const restaurants = await getRestaurantList()

      // 今週の月曜日から金曜日まで適当な店舗を追加
      const today = new Date()
      const monday = new Date(today)
      monday.setDate(today.getDate() - today.getDay() + 1)

      for (let i = 0; i < 5; i++) {
        const testDate = new Date(monday)
        testDate.setDate(monday.getDate() + i)

        if (testDate <= today) {
          const randomRestaurant = restaurants[Math.floor(Math.random() * restaurants.length)]
          addToHistoryForDate(randomRestaurant, testDate, "auto")
        }
      }

      return NextResponse.json({
        success: true,
        message: "テスト履歴を追加しました",
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.error("Error in selection analysis POST:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

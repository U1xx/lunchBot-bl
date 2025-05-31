import { NextResponse } from "next/server"
import { testSpreadsheetStructure, getRestaurantList } from "@/lib/google-sheets"

export async function GET() {
  try {
    // スプレッドシートの構造をテスト
    const structure = await testSpreadsheetStructure()

    // データの取得もテスト
    const restaurants = await getRestaurantList()

    return NextResponse.json({
      success: true,
      message: "スプレッドシートのテストが完了しました",
      structure,
      restaurantCount: restaurants.length,
      sampleRestaurant: restaurants[0],
    })
  } catch (error: any) {
    console.error("Error testing sheets:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: "スプレッドシートの設定を確認してください",
      },
      { status: 500 },
    )
  }
}

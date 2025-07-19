import { NextResponse } from "next/server"
import { defaultRestaurants, type RestaurantData } from "@/lib/restaurant-data"

export async function POST(request: Request) {
  try {
    const restaurantData: RestaurantData = await request.json()

    // 基本的なバリデーション
    if (!restaurantData.name || !restaurantData.genre) {
      return NextResponse.json({ success: false, error: "店名とジャンルは必須です" }, { status: 400 })
    }

    // 重複チェック
    const exists = defaultRestaurants.some((r) => r.name === restaurantData.name)
    if (exists) {
      return NextResponse.json({ success: false, error: "同じ名前の店舗が既に存在します" }, { status: 409 })
    }

    // レストランを追加
    defaultRestaurants.push({
      name: restaurantData.name,
      genre: restaurantData.genre,
      address: restaurantData.address || "",
      url: restaurantData.url || "",
      orderUrl: restaurantData.orderUrl || "",
      phone: restaurantData.phone || "",
      description: restaurantData.description || "",
    })

    return NextResponse.json({
      success: true,
      message: `${restaurantData.name}を追加しました`,
      restaurant: restaurantData,
      totalRestaurants: defaultRestaurants.length,
    })
  } catch (error: any) {
    console.error("Error adding restaurant:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      restaurants: defaultRestaurants,
      count: defaultRestaurants.length,
    })
  } catch (error: any) {
    console.error("Error getting restaurants:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

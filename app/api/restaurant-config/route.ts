import { NextResponse } from "next/server"
import { restaurantConfig, defaultRestaurants, regionalRestaurants } from "@/lib/restaurant-data"

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      config: restaurantConfig,
      stats: {
        defaultRestaurants: defaultRestaurants.length,
        regionalRestaurants: Object.keys(regionalRestaurants).reduce(
          (acc, region) => {
            acc[region] = regionalRestaurants[region].length
            return acc
          },
          {} as { [key: string]: number },
        ),
        totalDefault: defaultRestaurants.length + (regionalRestaurants[restaurantConfig.region]?.length || 0),
      },
    })
  } catch (error: any) {
    console.error("Error getting restaurant config:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { useGoogleSheets, useDefaultData, region, mixRatio } = await request.json()

    // 設定を更新
    if (typeof useGoogleSheets === "boolean") {
      restaurantConfig.useGoogleSheets = useGoogleSheets
    }
    if (typeof useDefaultData === "boolean") {
      restaurantConfig.useDefaultData = useDefaultData
    }
    if (typeof region === "string") {
      restaurantConfig.region = region
    }
    if (typeof mixRatio === "number" && mixRatio >= 0 && mixRatio <= 1) {
      restaurantConfig.mixRatio = mixRatio
    }

    return NextResponse.json({
      success: true,
      message: "設定を更新しました",
      config: restaurantConfig,
    })
  } catch (error: any) {
    console.error("Error updating restaurant config:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

import { google } from "googleapis"
import { pickRandomRestaurantWithHistory, addToHistory } from "./history"
import { defaultRestaurants, regionalRestaurants, restaurantConfig, type RestaurantData } from "./restaurant-data"
import { searchRestaurants } from "./web-search"

// Google Sheetsからレストランリストを取得する関数
export async function getRestaurantList(): Promise<RestaurantData[]> {
  let restaurants: RestaurantData[] = []

  // Google Sheetsからデータを取得
  if (restaurantConfig.useGoogleSheets) {
    try {
      const sheetsData = await getRestaurantListFromSheets()
      restaurants = [...restaurants, ...sheetsData]
      console.log(`Loaded ${sheetsData.length} restaurants from Google Sheets`)
    } catch (error) {
      console.error("Error loading from Google Sheets:", error)
      console.log("Falling back to default data")
    }
  }

  // デフォルトデータを追加
  if (restaurantConfig.useDefaultData) {
    const defaultData = [...defaultRestaurants]

    // 地域別データも追加
    if (regionalRestaurants[restaurantConfig.region]) {
      defaultData.push(...regionalRestaurants[restaurantConfig.region])
    }

    restaurants = [...restaurants, ...defaultData]
    console.log(`Added ${defaultData.length} default restaurants`)
  }

  // Web検索結果を追加（オプション）
  if (process.env.ENABLE_WEB_SEARCH === "true") {
    try {
      const searchResults = await searchRestaurants("レストラン", restaurantConfig.region)
      const webRestaurants = searchResults.map((result) => ({
        name: result.name,
        genre: result.genre || "レストラン",
        address: result.address || "",
        url: result.url,
        orderUrl: result.orderUrl,
        description: result.description,
      }))

      restaurants = [...restaurants, ...webRestaurants]
      console.log(`Added ${webRestaurants.length} restaurants from web search`)
    } catch (error) {
      console.error("Error loading from web search:", error)
    }
  }

  // 重複を除去（名前ベース）
  const uniqueRestaurants = restaurants.filter(
    (restaurant, index, self) => index === self.findIndex((r) => r.name === restaurant.name),
  )

  console.log(`Total unique restaurants: ${uniqueRestaurants.length}`)

  if (uniqueRestaurants.length === 0) {
    throw new Error("レストランデータが見つかりません。設定を確認してください。")
  }

  return uniqueRestaurants
}

// Google Sheetsからデータを取得（既存の関数を改名）
async function getRestaurantListFromSheets(): Promise<RestaurantData[]> {
  try {
    const sheets = google.sheets({
      version: "v4",
      auth: process.env.GOOGLE_SHEETS_API_KEY,
    })

    // まずスプレッドシートの情報を取得してシート名を確認
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    })

    console.log(
      "Available sheets:",
      spreadsheetInfo.data.sheets?.map((sheet) => sheet.properties?.title),
    )

    // 最初のシートの名前を取得
    const firstSheetName = spreadsheetInfo.data.sheets?.[0]?.properties?.title || "Sheet1"
    console.log("Using sheet:", firstSheetName)

    // データを取得（範囲を拡張してorderUrlも含める）
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${firstSheetName}!A:F`, // F列まで拡張（orderUrl用）
    })

    const rows = response.data.values

    if (!rows || rows.length === 0) {
      throw new Error("スプレッドシートにデータが見つかりません。")
    }

    if (rows.length < 2) {
      throw new Error("ヘッダー行のみでデータ行がありません。")
    }

    // ヘッダー行を除外し、各行をオブジェクトに変換
    const headers = rows[0]
    console.log("Headers found:", headers)

    const restaurants = rows
      .slice(1)
      .filter((row) => row[0] && row[0].trim()) // 名前が空でない行のみ
      .map(
        (row): RestaurantData => ({
          name: row[0] || "",
          genre: row[1] || "",
          address: row[2] || "",
          url: row[3] || "",
          orderUrl: row[4] || "", // E列：注文サイトURL
          phone: row[5] || "", // F列：電話番号（オプション）
        }),
      )

    console.log(`Found ${restaurants.length} restaurants in Google Sheets`)

    if (restaurants.length === 0) {
      throw new Error("有効なレストランデータが見つかりません。")
    }

    return restaurants
  } catch (error: any) {
    console.error("Error fetching data from Google Sheets:", error)

    // より詳細なエラーメッセージを提供
    if (error.message.includes("Unable to parse range")) {
      throw new Error("スプレッドシートの範囲が無効です。シート名を確認してください。")
    } else if (error.message.includes("not found")) {
      throw new Error("スプレッドシートが見つかりません。GOOGLE_SHEET_IDを確認してください。")
    } else if (error.message.includes("permission")) {
      throw new Error(
        "スプレッドシートへのアクセス権限がありません。スプレッドシートを公開するか、サービスアカウントを使用してください。",
      )
    }

    throw error
  }
}

// 履歴を考慮したランダム選択（強化版）
export function pickRandomRestaurant(restaurants: RestaurantData[], targetDate: Date = new Date()) {
  if (!restaurants || restaurants.length === 0) {
    throw new Error("選択可能なレストランがありません")
  }

  const selected = pickRandomRestaurantWithHistory(restaurants, targetDate)

  // 履歴に追加
  addToHistory(selected, "auto")

  return selected
}

// 手動選択用（履歴に記録）
export function pickRandomRestaurantManual(restaurants: RestaurantData[]) {
  if (!restaurants || restaurants.length === 0) {
    throw new Error("選択可能なレストランがありません")
  }

  const randomIndex = Math.floor(Math.random() * restaurants.length)
  const selected = restaurants[randomIndex]

  // 履歴に追加
  addToHistory(selected, "manual")

  return selected
}

// スプレッドシートの構造をテストする関数
export async function testSpreadsheetStructure() {
  try {
    const sheets = google.sheets({
      version: "v4",
      auth: process.env.GOOGLE_SHEETS_API_KEY,
    })

    // スプレッドシートの基本情報を取得
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    })

    const result = {
      title: spreadsheetInfo.data.properties?.title,
      sheets: spreadsheetInfo.data.sheets?.map((sheet) => ({
        name: sheet.properties?.title,
        rowCount: sheet.properties?.gridProperties?.rowCount,
        columnCount: sheet.properties?.gridProperties?.columnCount,
      })),
    }

    return result
  } catch (error: any) {
    console.error("Error testing spreadsheet structure:", error)
    throw error
  }
}

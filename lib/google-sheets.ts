import { google } from "googleapis"

// Google Sheetsからレストランリストを取得する関数
export async function getRestaurantList() {
  try {
    const sheets = google.sheets({
      version: "v4",
      auth: process.env.GOOGLE_SHEETS_API_KEY,
    })

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:D", // スプレッドシートの範囲を適宜調整してください
    })

    const rows = response.data.values

    if (!rows || rows.length === 0) {
      throw new Error("No data found in the spreadsheet")
    }

    // ヘッダー行を除外し、各行をオブジェクトに変換
    const headers = rows[0]
    const restaurants = rows.slice(1).map((row) => {
      const restaurant: Record<string, string> = {}
      headers.forEach((header: string, i: number) => {
        restaurant[header] = row[i] || ""
      })
      return restaurant
    })

    return restaurants
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error)
    throw error
  }
}

// ランダムにレストランを選択する関数
export function pickRandomRestaurant(restaurants: any[]) {
  if (!restaurants || restaurants.length === 0) {
    throw new Error("No restaurants available")
  }
  const randomIndex = Math.floor(Math.random() * restaurants.length)
  return restaurants[randomIndex]
}

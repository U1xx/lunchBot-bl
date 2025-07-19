import { google } from "googleapis"
import { pickRandomRestaurantWithHistory, addToHistory } from "./history"

// Google Sheetsからレストランリストを取得する関数
export async function getRestaurantList() {
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

    // データを取得（範囲を動的に設定）
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${firstSheetName}!A:D`, // シート名を動的に設定
    })

    const rows = response.data.values

    if (!rows || rows.length === 0) {
      throw new Error("スプレッドシートにデータが見つかりません。データを追加してください。")
    }

    if (rows.length < 2) {
      throw new Error("ヘッダー行のみでデータ行がありません。レストランデータを追加してください。")
    }

    // ヘッダー行を除外し、各行をオブジェクトに変換
    const headers = rows[0]
    console.log("Headers found:", headers)

    const restaurants = rows
      .slice(1)
      .filter((row) => row[0] && row[0].trim()) // 名前が空でない行のみ
      .map((row) => {
        const restaurant: Record<string, string> = {}
        headers.forEach((header: string, i: number) => {
          restaurant[header] = row[i] || ""
        })
        return restaurant
      })

    console.log(`Found ${restaurants.length} restaurants`)

    if (restaurants.length === 0) {
      throw new Error("有効なレストランデータが見つかりません。名前列（A列）にデータを入力してください。")
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
export function pickRandomRestaurant(restaurants: any[], targetDate: Date = new Date()) {
  if (!restaurants || restaurants.length === 0) {
    throw new Error("選択可能なレストランがありません")
  }

  const selected = pickRandomRestaurantWithHistory(restaurants, targetDate)

  // 履歴に追加
  addToHistory(selected, "auto")

  return selected
}

// 手動選択用（履歴に記録）
export function pickRandomRestaurantManual(restaurants: any[]) {
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

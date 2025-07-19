// 選択履歴管理ユーティリティ（強化版）

import { isWeekday } from "./holidays"

export interface LunchHistory {
  id: string
  restaurantName: string
  selectedAt: Date
  selectedBy: "auto" | "manual" | "vote"
  channelId: string
  messageTs?: string
  weekNumber?: number // 週番号を追加
  businessDaySequence?: number // 営業日の連番を追加
}

// 簡易的なメモリストレージ（本格運用時はデータベース推奨）
let historyStorage: LunchHistory[] = []

/**
 * 週番号を取得（年の第何週目か）
 */
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

/**
 * 営業日の連番を取得（年始からの営業日数）
 */
function getBusinessDaySequence(date: Date): number {
  const year = date.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  let businessDayCount = 0

  const currentDate = new Date(startOfYear)
  while (currentDate <= date) {
    if (isWeekday(currentDate)) {
      businessDayCount++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return businessDayCount
}

/**
 * 選択履歴を追加
 */
export function addToHistory(restaurant: any, selectedBy: "auto" | "manual" | "vote" = "auto"): void {
  const now = new Date()
  const history: LunchHistory = {
    id: Date.now().toString(),
    restaurantName: restaurant.name || restaurant,
    selectedAt: now,
    selectedBy,
    channelId: process.env.SLACK_CHANNEL_ID || "",
    weekNumber: getWeekNumber(now),
    businessDaySequence: getBusinessDaySequence(now),
  }

  historyStorage.push(history)

  // 直近100件のみ保持
  if (historyStorage.length > 100) {
    historyStorage = historyStorage.slice(-100)
  }

  console.log(
    `Added to history: ${history.restaurantName} (Week: ${history.weekNumber}, BusinessDay: ${history.businessDaySequence})`,
  )
}

/**
 * 同じ週に選ばれた店舗を取得
 */
export function getRestaurantsSelectedThisWeek(targetDate: Date = new Date()): string[] {
  const targetWeek = getWeekNumber(targetDate)
  const targetYear = targetDate.getFullYear()

  return historyStorage
    .filter((h) => {
      const historyYear = h.selectedAt.getFullYear()
      return historyYear === targetYear && h.weekNumber === targetWeek
    })
    .map((h) => h.restaurantName)
}

/**
 * 連続する営業日に選ばれた店舗を取得
 */
export function getRestaurantsSelectedInConsecutiveBusinessDays(targetDate: Date = new Date()): string[] {
  const targetBusinessDay = getBusinessDaySequence(targetDate)

  // 前の営業日を取得
  const previousBusinessDay = new Date(targetDate)
  previousBusinessDay.setDate(previousBusinessDay.getDate() - 1)

  // 土日祝日を遡って前の営業日を見つける
  while (
    !isWeekday(previousBusinessDay) &&
    previousBusinessDay > new Date(targetDate.getTime() - 7 * 24 * 60 * 60 * 1000)
  ) {
    previousBusinessDay.setDate(previousBusinessDay.getDate() - 1)
  }

  if (!isWeekday(previousBusinessDay)) {
    return [] // 前の営業日が見つからない場合
  }

  const previousBusinessDaySequence = getBusinessDaySequence(previousBusinessDay)

  console.log(`Checking consecutive business days: ${previousBusinessDaySequence} -> ${targetBusinessDay}`)

  // 前の営業日に選ばれた店舗を取得
  return historyStorage
    .filter((h) => h.businessDaySequence === previousBusinessDaySequence)
    .map((h) => h.restaurantName)
}

/**
 * 最近選ばれた店舗を取得（指定日数以内）
 */
export function getRecentSelections(days = 7): string[] {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  return historyStorage.filter((h) => h.selectedAt > cutoffDate).map((h) => h.restaurantName)
}

/**
 * 重複を避けたランダム選択（強化版）
 */
export function pickRandomRestaurantWithHistory(restaurants: any[], targetDate: Date = new Date()): any {
  console.log(`\n=== Restaurant Selection Logic ===`)
  console.log(`Target date: ${targetDate.toISOString().split("T")[0]}`)
  console.log(`Total restaurants: ${restaurants.length}`)

  // 1. 同じ週に選ばれた店舗を除外
  const sameWeekRestaurants = getRestaurantsSelectedThisWeek(targetDate)
  console.log(`Restaurants selected this week: ${sameWeekRestaurants.join(", ") || "None"}`)

  // 2. 連続する営業日に選ばれた店舗を除外
  const consecutiveRestaurants = getRestaurantsSelectedInConsecutiveBusinessDays(targetDate)
  console.log(`Restaurants selected in consecutive business days: ${consecutiveRestaurants.join(", ") || "None"}`)

  // 除外する店舗のリスト
  const excludedRestaurants = [...new Set([...sameWeekRestaurants, ...consecutiveRestaurants])]
  console.log(`Excluded restaurants: ${excludedRestaurants.join(", ") || "None"}`)

  // 利用可能な店舗をフィルタリング
  const availableRestaurants = restaurants.filter((r) => !excludedRestaurants.includes(r.name))
  console.log(`Available restaurants: ${availableRestaurants.length}`)

  // 利用可能な店舗がない場合は全店舗から選択（警告付き）
  let candidateRestaurants = availableRestaurants
  let selectionNote = ""

  if (availableRestaurants.length === 0) {
    candidateRestaurants = restaurants
    selectionNote = "⚠️ 全ての店舗が除外条件に該当するため、全店舗から選択しました"
    console.log("WARNING: No available restaurants, selecting from all restaurants")
  } else if (availableRestaurants.length < restaurants.length * 0.3) {
    // 利用可能な店舗が30%未満の場合は警告
    selectionNote = `ℹ️ 利用可能な店舗が少なくなっています（${availableRestaurants.length}/${restaurants.length}店舗）`
    console.log(`WARNING: Limited restaurant options (${availableRestaurants.length}/${restaurants.length})`)
  }

  const randomIndex = Math.floor(Math.random() * candidateRestaurants.length)
  const selected = candidateRestaurants[randomIndex]

  console.log(`Selected restaurant: ${selected.name}`)
  console.log(`Selection note: ${selectionNote}`)
  console.log(`=== End Selection Logic ===\n`)

  // 選択理由を追加
  selected._selectionNote = selectionNote

  return selected
}

/**
 * 選択統計を取得
 */
export function getSelectionStats(days = 30): { [restaurantName: string]: number } {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const recentHistory = historyStorage.filter((h) => h.selectedAt > cutoffDate)

  const stats: { [key: string]: number } = {}
  recentHistory.forEach((h) => {
    stats[h.restaurantName] = (stats[h.restaurantName] || 0) + 1
  })

  return stats
}

/**
 * 詳細な選択分析を取得
 */
export function getDetailedSelectionAnalysis(targetDate: Date = new Date()) {
  const currentWeek = getWeekNumber(targetDate)
  const currentBusinessDay = getBusinessDaySequence(targetDate)

  return {
    currentWeek,
    currentBusinessDay,
    sameWeekSelections: getRestaurantsSelectedThisWeek(targetDate),
    consecutiveSelections: getRestaurantsSelectedInConsecutiveBusinessDays(targetDate),
    recentSelections: getRecentSelections(7),
    weeklyStats: getWeeklyStats(),
  }
}

/**
 * 週別統計を取得
 */
function getWeeklyStats() {
  const weeklyStats: { [week: string]: { [restaurant: string]: number } } = {}

  historyStorage.forEach((h) => {
    const weekKey = `${h.selectedAt.getFullYear()}-W${h.weekNumber}`
    if (!weeklyStats[weekKey]) {
      weeklyStats[weekKey] = {}
    }
    weeklyStats[weekKey][h.restaurantName] = (weeklyStats[weekKey][h.restaurantName] || 0) + 1
  })

  return weeklyStats
}

/**
 * 履歴をクリア
 */
export function clearHistory(): void {
  historyStorage = []
}

/**
 * 全履歴を取得
 */
export function getAllHistory(): LunchHistory[] {
  return [...historyStorage].reverse() // 新しい順
}

/**
 * テスト用：特定の日付で履歴を追加
 */
export function addToHistoryForDate(
  restaurant: any,
  date: Date,
  selectedBy: "auto" | "manual" | "vote" = "auto",
): void {
  const history: LunchHistory = {
    id: `test-${Date.now()}`,
    restaurantName: restaurant.name || restaurant,
    selectedAt: date,
    selectedBy,
    channelId: process.env.SLACK_CHANNEL_ID || "",
    weekNumber: getWeekNumber(date),
    businessDaySequence: getBusinessDaySequence(date),
  }

  historyStorage.push(history)
  console.log(`Added test history: ${history.restaurantName} on ${date.toISOString().split("T")[0]}`)
}

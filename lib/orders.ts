// 注文取りまとめ管理ユーティリティ

import { isWeekday } from "./holidays"

export interface MenuItem {
  id: string
  name: string
  price?: number
  description?: string
  category?: string
}

export interface Order {
  id: string
  userId: string
  userName: string
  userDisplayName?: string
  menuItem: string
  quantity: number
  notes?: string
  timestamp: Date
  messageTs?: string
  channelId: string
}

export interface OrderSession {
  id: string
  date: Date
  restaurant: any
  isActive: boolean
  orders: Order[]
  createdAt: Date
  closedAt?: Date
  totalAmount?: number
  summary?: string
}

// メモリストレージ（本格運用時はデータベース推奨）
let orderSessions: OrderSession[] = []
let menuMessages: { [sessionId: string]: any[] } = {}

/**
 * 新しい注文セッションを作成
 */
export function createOrderSession(restaurant: any): OrderSession {
  const session: OrderSession = {
    id: `session-${Date.now()}`,
    date: new Date(),
    restaurant,
    isActive: true,
    orders: [],
    createdAt: new Date(),
  }

  orderSessions.push(session)
  menuMessages[session.id] = []

  console.log(`Created order session: ${session.id} for ${restaurant.name}`)
  return session
}

/**
 * アクティブな注文セッションを取得
 */
export function getActiveOrderSession(): OrderSession | null {
  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]

  return (
    orderSessions.find((session) => {
      const sessionDateStr = session.date.toISOString().split("T")[0]
      return session.isActive && sessionDateStr === todayStr
    }) || null
  )
}

/**
 * 注文セッションを取得
 */
export function getOrderSession(sessionId: string): OrderSession | null {
  return orderSessions.find((session) => session.id === sessionId) || null
}

/**
 * メニュー投稿を記録
 */
export function addMenuMessage(sessionId: string, message: any): void {
  if (!menuMessages[sessionId]) {
    menuMessages[sessionId] = []
  }

  menuMessages[sessionId].push({
    ...message,
    recordedAt: new Date(),
  })

  console.log(`Added menu message to session ${sessionId}`)
}

/**
 * 注文を追加
 */
export function addOrder(
  sessionId: string,
  userId: string,
  userName: string,
  menuItem: string,
  quantity = 1,
  notes?: string,
): Order | null {
  const session = getOrderSession(sessionId)
  if (!session || !session.isActive) {
    return null
  }

  // 既存の注文を確認（同じユーザーの同じメニューは数量を更新）
  const existingOrder = session.orders.find((order) => order.userId === userId && order.menuItem === menuItem)

  if (existingOrder) {
    existingOrder.quantity += quantity
    existingOrder.timestamp = new Date()
    if (notes) existingOrder.notes = notes
    console.log(`Updated existing order: ${existingOrder.id}`)
    return existingOrder
  }

  const order: Order = {
    id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    userName,
    menuItem,
    quantity,
    notes,
    timestamp: new Date(),
    channelId: process.env.SLACK_CHANNEL_ID || "",
  }

  session.orders.push(order)
  console.log(`Added new order: ${order.id} - ${userName}: ${menuItem} x${quantity}`)
  return order
}

/**
 * 注文を削除
 */
export function removeOrder(sessionId: string, orderId: string): boolean {
  const session = getOrderSession(sessionId)
  if (!session) return false

  const orderIndex = session.orders.findIndex((order) => order.id === orderId)
  if (orderIndex === -1) return false

  const removedOrder = session.orders.splice(orderIndex, 1)[0]
  console.log(`Removed order: ${removedOrder.id}`)
  return true
}

/**
 * 注文セッションを終了
 */
export function closeOrderSession(sessionId: string): OrderSession | null {
  const session = getOrderSession(sessionId)
  if (!session) return null

  session.isActive = false
  session.closedAt = new Date()
  session.summary = generateOrderSummary(session)

  console.log(`Closed order session: ${sessionId}`)
  return session
}

/**
 * 注文サマリーを生成
 */
export function generateOrderSummary(session: OrderSession): string {
  if (session.orders.length === 0) {
    return "注文はありませんでした。"
  }

  // メニューごとに集計
  const menuSummary: { [menuItem: string]: { quantity: number; users: string[] } } = {}

  session.orders.forEach((order) => {
    if (!menuSummary[order.menuItem]) {
      menuSummary[order.menuItem] = { quantity: 0, users: [] }
    }
    menuSummary[order.menuItem].quantity += order.quantity
    menuSummary[order.menuItem].users.push(`${order.userName}(${order.quantity})`)
  })

  let summary = `📋 **${session.restaurant.name}** 注文取りまとめ\n\n`
  summary += `📅 日時: ${session.date.toLocaleDateString("ja-JP")}\n`
  summary += `👥 注文者数: ${new Set(session.orders.map((o) => o.userId)).size}名\n`
  summary += `📦 総注文数: ${session.orders.reduce((sum, o) => sum + o.quantity, 0)}個\n\n`

  summary += `**📋 メニュー別集計:**\n`
  Object.entries(menuSummary).forEach(([menuItem, data]) => {
    summary += `• ${menuItem}: ${data.quantity}個\n`
    summary += `  └ ${data.users.join(", ")}\n`
  })

  summary += `\n**👤 個別注文:**\n`
  session.orders.forEach((order) => {
    summary += `• ${order.userName}: ${order.menuItem} x${order.quantity}`
    if (order.notes) summary += ` (${order.notes})`
    summary += `\n`
  })

  return summary
}

/**
 * 今日のメニュー投稿を取得
 */
export function getTodayMenuMessages(): any[] {
  const activeSession = getActiveOrderSession()
  if (!activeSession) return []

  return menuMessages[activeSession.id] || []
}

/**
 * 注文可能時間かチェック
 */
export function isOrderingTime(): boolean {
  const now = new Date()
  const japanTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }))

  // 平日かつ11:00以前
  return isWeekday(japanTime) && japanTime.getHours() < 11
}

/**
 * 全セッションを取得
 */
export function getAllOrderSessions(): OrderSession[] {
  return [...orderSessions].reverse() // 新しい順
}

/**
 * セッションをクリア
 */
export function clearOrderSessions(): void {
  orderSessions = []
  menuMessages = {}
}

/**
 * テスト用データを追加
 */
export function addTestOrderData(): void {
  const testRestaurant = { name: "テスト食堂", genre: "定食" }
  const session = createOrderSession(testRestaurant)

  // テスト注文を追加
  addOrder(session.id, "U123456", "田中太郎", "唐揚げ弁当", 1, "ご飯大盛り")
  addOrder(session.id, "U789012", "佐藤花子", "チキン南蛮弁当", 1)
  addOrder(session.id, "U345678", "鈴木次郎", "唐揚げ弁当", 2, "タルタル多め")

  console.log("Added test order data")
}

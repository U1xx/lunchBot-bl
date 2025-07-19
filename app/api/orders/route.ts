import { NextResponse } from "next/server"
import {
  getAllOrderSessions,
  getActiveOrderSession,
  createOrderSession,
  closeOrderSession,
  addTestOrderData,
  clearOrderSessions,
  isOrderingTime,
} from "@/lib/orders"

export async function GET() {
  try {
    const activeSession = getActiveOrderSession()
    const allSessions = getAllOrderSessions()

    return NextResponse.json({
      success: true,
      activeSession,
      allSessions: allSessions.slice(0, 10), // 最新10件
      isOrderingTime: isOrderingTime(),
      totalSessions: allSessions.length,
    })
  } catch (error: any) {
    console.error("Error getting orders:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { action, restaurant, sessionId } = await request.json()

    if (action === "createSession") {
      if (!restaurant) {
        return NextResponse.json({ success: false, error: "Restaurant data required" }, { status: 400 })
      }

      const session = createOrderSession(restaurant)
      return NextResponse.json({
        success: true,
        session,
        message: "注文セッションを作成しました",
      })
    }

    if (action === "closeSession") {
      if (!sessionId) {
        return NextResponse.json({ success: false, error: "Session ID required" }, { status: 400 })
      }

      const session = closeOrderSession(sessionId)
      if (!session) {
        return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        session,
        message: "注文セッションを終了しました",
      })
    }

    if (action === "addTestData") {
      addTestOrderData()
      return NextResponse.json({
        success: true,
        message: "テストデータを追加しました",
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error: any) {
    console.error("Error in orders POST:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    clearOrderSessions()
    return NextResponse.json({
      success: true,
      message: "全ての注文セッションをクリアしました",
    })
  } catch (error: any) {
    console.error("Error clearing orders:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

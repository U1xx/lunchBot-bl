import { NextResponse } from "next/server"
import { getActiveOrderSession, closeOrderSession } from "@/lib/orders"
import { sendOrderSummary } from "@/lib/slack"

export async function POST() {
  try {
    const activeSession = getActiveOrderSession()

    if (!activeSession) {
      return NextResponse.json(
        {
          success: false,
          error: "アクティブな注文セッションがありません",
        },
        { status: 404 },
      )
    }

    // セッションを終了
    const closedSession = closeOrderSession(activeSession.id)

    if (!closedSession) {
      return NextResponse.json(
        {
          success: false,
          error: "セッションの終了に失敗しました",
        },
        { status: 500 },
      )
    }

    // Slackに取りまとめ結果を送信
    await sendOrderSummary(closedSession)

    return NextResponse.json({
      success: true,
      session: closedSession,
      message: "注文を取りまとめてSlackに送信しました",
    })
  } catch (error: any) {
    console.error("Error collecting orders:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

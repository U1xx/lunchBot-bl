import { NextResponse } from "next/server"
import { getAllHistory, getSelectionStats, clearHistory } from "@/lib/history"

export async function GET() {
  try {
    const history = getAllHistory()
    const stats30Days = getSelectionStats(30)
    const stats7Days = getSelectionStats(7)

    return NextResponse.json({
      success: true,
      history: history.slice(0, 20), // 最新20件
      stats: {
        last30Days: stats30Days,
        last7Days: stats7Days,
      },
      totalRecords: history.length,
    })
  } catch (error: any) {
    console.error("Error getting history:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    clearHistory()
    return NextResponse.json({
      success: true,
      message: "履歴をクリアしました",
    })
  } catch (error: any) {
    console.error("Error clearing history:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

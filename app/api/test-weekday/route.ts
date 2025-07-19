import { NextResponse } from "next/server"
import { isWeekday, getHolidayName, getNextWeekday } from "@/lib/holidays"

export async function GET() {
  try {
    const now = new Date()
    const japanTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }))

    const isCurrentWeekday = isWeekday(japanTime)
    const holidayName = getHolidayName(japanTime)
    const nextWeekday = getNextWeekday(japanTime)

    // 今週の平日をチェック
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(japanTime)
      checkDate.setDate(checkDate.getDate() + i)

      weekDays.push({
        date: checkDate.toISOString().split("T")[0],
        dayName: checkDate.toLocaleDateString("ja-JP", { weekday: "long" }),
        isWeekday: isWeekday(checkDate),
        holidayName: getHolidayName(checkDate),
      })
    }

    return NextResponse.json({
      success: true,
      currentTime: japanTime.toISOString(),
      currentDate: japanTime.toISOString().split("T")[0],
      isCurrentWeekday,
      holidayName,
      nextWeekday: nextWeekday.toISOString().split("T")[0],
      weekDays,
      message: isCurrentWeekday ? "今日は平日です" : `今日は${holidayName || "土日"}のため平日ではありません`,
    })
  } catch (error: any) {
    console.error("Error in weekday test:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

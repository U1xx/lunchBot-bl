// 日本の祝日を判定するユーティリティ

interface Holiday {
  name: string
  date: string // YYYY-MM-DD format
}

// 2024年の祝日リスト（毎年更新が必要）
const holidays2024: Holiday[] = [
  { name: "元日", date: "2024-01-01" },
  { name: "成人の日", date: "2024-01-08" },
  { name: "建国記念の日", date: "2024-02-11" },
  { name: "建国記念の日 振替休日", date: "2024-02-12" },
  { name: "天皇誕生日", date: "2024-02-23" },
  { name: "春分の日", date: "2024-03-20" },
  { name: "昭和の日", date: "2024-04-29" },
  { name: "憲法記念日", date: "2024-05-03" },
  { name: "みどりの日", date: "2024-05-04" },
  { name: "こどもの日", date: "2024-05-05" },
  { name: "こどもの日 振替休日", date: "2024-05-06" },
  { name: "海の日", date: "2024-07-15" },
  { name: "山の日", date: "2024-08-11" },
  { name: "山の日 振替休日", date: "2024-08-12" },
  { name: "敬老の日", date: "2024-09-16" },
  { name: "秋分の日", date: "2024-09-22" },
  { name: "秋分の日 振替休日", date: "2024-09-23" },
  { name: "スポーツの日", date: "2024-10-14" },
  { name: "文化の日", date: "2024-11-03" },
  { name: "文化の日 振替休日", date: "2024-11-04" },
  { name: "勤労感謝の日", date: "2024-11-23" },
]

// 2025年の祝日リスト
const holidays2025: Holiday[] = [
  { name: "元日", date: "2025-01-01" },
  { name: "成人の日", date: "2025-01-13" },
  { name: "建国記念の日", date: "2025-02-11" },
  { name: "天皇誕生日", date: "2025-02-23" },
  { name: "天皇誕生日 振替休日", date: "2025-02-24" },
  { name: "春分の日", date: "2025-03-20" },
  { name: "昭和の日", date: "2025-04-29" },
  { name: "憲法記念日", date: "2025-05-03" },
  { name: "みどりの日", date: "2025-05-04" },
  { name: "こどもの日", date: "2025-05-05" },
  { name: "こどもの日 振替休日", date: "2025-05-06" },
  { name: "海の日", date: "2025-07-21" },
  { name: "山の日", date: "2025-08-11" },
  { name: "敬老の日", date: "2025-09-15" },
  { name: "秋分の日", date: "2025-09-23" },
  { name: "スポーツの日", date: "2025-10-13" },
  { name: "文化の日", date: "2025-11-03" },
  { name: "勤労感謝の日", date: "2025-11-23" },
]

// 全祝日リスト
const allHolidays = [...holidays2024, ...holidays2025]

/**
 * 指定された日付が日本の祝日かどうかを判定
 */
export function isJapaneseHoliday(date: Date): boolean {
  const dateString = date.toISOString().split("T")[0] // YYYY-MM-DD format
  return allHolidays.some((holiday) => holiday.date === dateString)
}

/**
 * 指定された日付が平日（土日祝日以外）かどうかを判定
 */
export function isWeekday(date: Date): boolean {
  const dayOfWeek = date.getDay() // 0=日曜日, 1=月曜日, ..., 6=土曜日

  // 土日をチェック
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false
  }

  // 祝日をチェック
  if (isJapaneseHoliday(date)) {
    return false
  }

  return true
}

/**
 * 指定された日付の祝日名を取得（祝日でない場合はnull）
 */
export function getHolidayName(date: Date): string | null {
  const dateString = date.toISOString().split("T")[0]
  const holiday = allHolidays.find((h) => h.date === dateString)
  return holiday ? holiday.name : null
}

/**
 * 次の平日を取得
 */
export function getNextWeekday(date: Date): Date {
  const nextDay = new Date(date)
  nextDay.setDate(nextDay.getDate() + 1)

  while (!isWeekday(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1)
  }

  return nextDay
}

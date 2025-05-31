import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // 本番環境でのみ認証を要求する場合はここに追加
  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}

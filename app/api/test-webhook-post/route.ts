import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("=== Test Webhook POST ===")
    console.log("Headers:", Object.fromEntries(request.headers.entries()))

    const contentType = request.headers.get("content-type") || ""
    console.log("Content-Type:", contentType)

    let body
    if (contentType.includes("application/json")) {
      body = await request.json()
    } else {
      body = await request.text()
    }

    console.log("Body:", body)

    return NextResponse.json({
      success: true,
      message: "POST request received successfully",
      contentType,
      body,
    })
  } catch (error: any) {
    console.error("Test webhook error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Test webhook endpoint is working",
    methods: ["GET", "POST"],
  })
}

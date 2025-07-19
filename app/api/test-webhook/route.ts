import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Webhookエンドポイントが正常に動作するかテスト
    const webhookUrl = `${process.env.VERCEL_URL || "http://localhost:3000"}/api/slack-webhook`

    const testPayload = {
      type: "block_actions",
      user: {
        id: "U123456789",
        name: "test_user",
      },
      actions: [
        {
          action_id: "lunch_reject",
          type: "button",
        },
      ],
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testPayload),
    })

    const result = await response.text()

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      webhookUrl,
      response: result,
      message: response.ok ? "Webhook test successful" : "Webhook test failed",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Webhook test failed",
      },
      { status: 500 },
    )
  }
}

// Cloudflare Workers用のシンプルなランチボット

const GOOGLE_SHEETS_API_URL = "https://sheets.googleapis.com/v4/spreadsheets"

// Google Sheetsからデータを取得
async function getRestaurantList() {
  const url = `${GOOGLE_SHEETS_API_URL}/${GOOGLE_SHEET_ID}/values/Sheet1!A:D?key=${GOOGLE_SHEETS_API_KEY}`

  const response = await fetch(url)
  const data = await response.json()

  if (!data.values || data.values.length === 0) {
    throw new Error("No data found in spreadsheet")
  }

  const [headers, ...rows] = data.values
  return rows.map((row) => ({
    name: row[0] || "",
    genre: row[1] || "",
    address: row[2] || "",
    url: row[3] || "",
  }))
}

// ランダムに選択
function pickRandomRestaurant(restaurants) {
  return restaurants[Math.floor(Math.random() * restaurants.length)]
}

// Slackにメッセージ送信
async function sendToSlack(restaurant) {
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🍽️ 今日のランチ候補 🍽️",
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${restaurant.name}*`,
      },
    },
  ]

  if (restaurant.genre) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `🍴 *ジャンル:* ${restaurant.genre}`,
      },
    })
  }

  if (restaurant.address) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `📍 *住所:* ${restaurant.address}`,
      },
    })
  }

  if (restaurant.url) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `🔗 <${restaurant.url}|詳細を見る>`,
      },
    })
  }

  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: SLACK_CHANNEL_ID,
      blocks: blocks,
      text: `今日のランチ候補: ${restaurant.name}`,
    }),
  })

  return response.json()
}

// メインハンドラー
export default {
  async fetch(request, env) {
    // 環境変数を設定
    global.GOOGLE_SHEETS_API_KEY = env.GOOGLE_SHEETS_API_KEY
    global.SLACK_BOT_TOKEN = env.SLACK_BOT_TOKEN
    global.SLACK_CHANNEL_ID = env.SLACK_CHANNEL_ID
    global.GOOGLE_SHEET_ID = env.GOOGLE_SHEET_ID

    const url = new URL(request.url)

    // CORS対応
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      })
    }

    try {
      if (url.pathname === "/lunch" || url.pathname === "/") {
        const restaurants = await getRestaurantList()
        const selected = pickRandomRestaurant(restaurants)
        await sendToSlack(selected)

        return new Response(
          JSON.stringify({
            success: true,
            restaurant: selected.name,
            message: "ランチ候補をSlackに送信しました",
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          },
        )
      }

      return new Response("Not Found", { status: 404 })
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      )
    }
  },

  // Cron Trigger（平日11時に実行）
  async scheduled(event, env, ctx) {
    global.GOOGLE_SHEETS_API_KEY = env.GOOGLE_SHEETS_API_KEY
    global.SLACK_BOT_TOKEN = env.SLACK_BOT_TOKEN
    global.SLACK_CHANNEL_ID = env.SLACK_CHANNEL_ID
    global.GOOGLE_SHEET_ID = env.GOOGLE_SHEET_ID

    try {
      const restaurants = await getRestaurantList()
      const selected = pickRandomRestaurant(restaurants)
      await sendToSlack(selected)
      console.log(`自動実行完了: ${selected.name}`)
    } catch (error) {
      console.error("自動実行エラー:", error)
    }
  },
}

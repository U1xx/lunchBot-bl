import { WebClient } from "@slack/web-api"
import { generateOrderSummary } from "./orders"

// Slack APIクライアントの初期化
const slack = new WebClient(process.env.SLACK_BOT_TOKEN)

// レストラン情報をフォーマットしてSlackに送信する関数
export async function sendLunchRecommendation(restaurant: any) {
  try {
    // レストラン情報からSlackメッセージを作成
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
          text: `*${restaurant.name || "名称不明"}*`,
        },
      },
    ]

    // 住所があれば追加
    if (restaurant.address) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `📍 *住所:* ${restaurant.address}`,
        },
      })
    }

    // ジャンルがあれば追加
    if (restaurant.genre) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🍴 *ジャンル:* ${restaurant.genre}`,
        },
      })
    }

    // URLがあれば追加
    if (restaurant.url) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `🔗 <${restaurant.url}|詳細を見る>`,
        },
      })
    }

    // 選択理由があれば追加
    if (restaurant._selectionNote) {
      blocks.push({
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: restaurant._selectionNote,
          },
        ],
      })
    }

    // 注文案内を追加
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "📝 *テイクアウト注文について*\nメニューを投稿してください（AM11:00まで）。後で注文を取りまとめます。",
      },
    })

    // アクションボタンを追加
    blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "👍 いいね！",
            emoji: true,
          },
          action_id: "lunch_approve",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "👎 別のお店を選ぶ",
            emoji: true,
          },
          action_id: "lunch_reject",
          style: "danger",
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "📋 注文を取りまとめる",
            emoji: true,
          },
          action_id: "collect_orders",
          style: "primary",
        },
      ],
    })

    // Slackにメッセージを送信
    const result = await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID!,
      blocks: blocks,
      text: `今日のランチ候補: ${restaurant.name || "名称不明"}`,
    })

    return result
  } catch (error) {
    console.error("Error sending message to Slack:", error)
    throw error
  }
}

// 注文取りまとめメッセージを送信
export async function sendOrderSummary(session: any) {
  try {
    const summary = generateOrderSummary(session)

    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📋 注文取りまとめ結果",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: summary,
        },
      },
    ]

    // 注文がある場合は編集ボタンのみ表示
    if (session.orders.length > 0) {
      blocks.push({
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "📝 注文を編集",
              emoji: true,
            },
            action_id: "edit_orders",
          },
        ],
      })
    }

    const result = await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID!,
      blocks: blocks,
      text: `注文取りまとめ: ${session.restaurant.name}`,
    })

    return result
  } catch (error) {
    console.error("Error sending order summary:", error)
    throw error
  }
}

// メニュー投稿の案内メッセージを送信
export async function sendMenuCollectionNotice(restaurant: any) {
  try {
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📝 メニュー投稿のお願い",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${restaurant.name}* のテイクアウト注文を取りまとめます！\n\n希望するメニューをこのチャンネルに投稿してください。`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*投稿例:*\n• 唐揚げ弁当 x1\n• チキン南蛮弁当 x2 (タルタル多め)\n• 日替わり定食",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "⏰ *締切: AM11:00*\n📋 後で「注文を取りまとめる」ボタンで集計します。",
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "📋 今すぐ取りまとめる",
              emoji: true,
            },
            action_id: "collect_orders_now",
            style: "primary",
          },
        ],
      },
    ]

    const result = await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID!,
      blocks: blocks,
      text: `メニュー投稿のお願い: ${restaurant.name}`,
    })

    return result
  } catch (error) {
    console.error("Error sending menu collection notice:", error)
    throw error
  }
}

// 投票メッセージをSlackに送信する関数
export async function sendVotingMessage(session: any) {
  try {
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🗳️ ランチ投票 🗳️",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "今日のランチ、どれにする？",
        },
      },
    ]

    session.restaurants.forEach((restaurant: any, index: number) => {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${index + 1}. ${restaurant.name}* - ${restaurant.genre || "ジャンル不明"}`,
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: `投票する (${index + 1})`,
            emoji: true,
          },
          action_id: `vote_${index}`,
          value: session.id,
        },
      })
    })

    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `投票は${Math.floor((session.endTime.getTime() - Date.now()) / (60 * 1000))}分後に締め切られます`,
        },
      ],
    })

    const result = await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID!,
      blocks: blocks,
      text: "ランチ投票を開始します！",
    })

    // Store the message timestamp in the voting session
    // session.messageTs = result.ts; // TODO: Fix this, session is not updated

    return result
  } catch (error) {
    console.error("Error sending voting message to Slack:", error)
    throw error
  }
}

// 投票結果をSlackに送信する関数
export async function sendVotingResults(sessionId: string, results: any) {
  try {
    const { winner, totalVotes } = results

    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🎉 投票結果 🎉",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${winner.restaurant.name}* が選ばれました！ (合計 ${totalVotes} 票)`,
        },
      },
    ]

    results.results.forEach((result: any) => {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${result.restaurant.name}: ${result.count} 票`,
        },
      })
    })

    const result = await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID!,
      blocks: blocks,
      text: "投票結果",
    })

    return result
  } catch (error) {
    console.error("Error sending voting results to Slack:", error)
    throw error
  }
}

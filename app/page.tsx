"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, ShoppingCart, BarChart3 } from "lucide-react"

/**
 * 管理ダッシュボード
 *  - ランチ候補選択
 *  - 注文取りまとめ
 *  - テスト / デバッグ各種
 */
export default function Home() {
  /* ------------- 汎用状態 ------------- */
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  /* ------------- ランチ履歴 / 選択分析 ------------- */
  const [historyData, setHistoryData] = useState<any>(null)
  const [analysisData, setAnalysisData] = useState<any>(null)

  /* ------------- 注文関連 ------------- */
  const [orderData, setOrderData] = useState<any>(null)

  /* ------------- テスト / デバッグ ------------- */
  const [sheetTest, setSheetTest] = useState<any>(null)
  const [weekdayTest, setWeekdayTest] = useState<any>(null)
  const [workspaceInfo, setWorkspaceInfo] = useState<any>(null)
  const [slackTest, setSlackTest] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [webhookTest, setWebhookTest] = useState<any>(null)

  /* ---------- 共通 fetch ヘルパー ---------- */
  const fetchJSON = async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options)
    return res.json()
  }

  /* ---------- ボタンクリックハンドラ ---------- */
  const triggerLunchPicker = async () => {
    setLoading(true)
    try {
      const data = await fetchJSON("/api/lunch-picker")
      setResult(data)
    } catch (err: any) {
      setResult({ success: false, error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await fetchJSON("/api/orders")
      setOrderData(data)
    } catch (err: any) {
      setOrderData({ success: false, error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const collectOrders = async () => {
    setLoading(true)
    try {
      const data = await fetchJSON("/api/collect-orders", { method: "POST" })
      setResult(data)
      /* 更新 */
      setTimeout(fetchOrders, 1000)
    } catch (err: any) {
      setResult({ success: false, error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const testSpreadsheet = async () => {
    setLoading(true)
    setSheetTest(null)

    try {
      const response = await fetch("/api/test-sheets")
      const data = await response.json()
      setSheetTest(data)
    } catch (error) {
      setSheetTest({
        success: false,
        error: error instanceof Error ? error.message : "テストに失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const testSlack = async () => {
    setLoading(true)
    setSlackTest(null)

    try {
      const response = await fetch("/api/test-slack")
      const data = await response.json()
      setSlackTest(data)
    } catch (error) {
      setSlackTest({
        success: false,
        error: error instanceof Error ? error.message : "Slackテストに失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const debugSlack = async () => {
    setLoading(true)
    setDebugInfo(null)

    try {
      const response = await fetch("/api/debug-slack")
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      setDebugInfo({
        success: false,
        error: error instanceof Error ? error.message : "デバッグに失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const listWorkspaces = async () => {
    setLoading(true)
    setWorkspaceInfo(null)

    try {
      const response = await fetch("/api/list-workspaces")
      const data = await response.json()
      setWorkspaceInfo(data)
    } catch (error) {
      setWorkspaceInfo({
        success: false,
        error: error instanceof Error ? error.message : "ワークスペース情報の取得に失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const testWebhook = async () => {
    setLoading(true)
    setWebhookTest(null)

    try {
      // まずGETでエンドポイントの存在確認
      const getResponse = await fetch("/api/slack-webhook")
      const getData = await getResponse.json()

      // POSTテストも実行
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

      const postResponse = await fetch("/api/slack-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
      })

      const postData = await postResponse.json()

      // 現在のURLを取得
      const currentUrl = window.location.origin
      const webhookUrl = `${currentUrl}/api/slack-webhook`

      setWebhookTest({
        success: getResponse.ok && postResponse.ok,
        getStatus: getResponse.status,
        postStatus: postResponse.status,
        webhookUrl,
        getResponse: getData,
        postResponse: postData,
        message:
          getResponse.ok && postResponse.ok
            ? "Webhookエンドポイントが正常に動作しています（GET/POST両方）"
            : "Webhookエンドポイントでエラーが発生しました",
      })
    } catch (error) {
      setWebhookTest({
        success: false,
        error: error instanceof Error ? error.message : "Webhookテストに失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const testWeekday = async () => {
    setLoading(true)
    setWeekdayTest(null)

    try {
      const response = await fetch("/api/test-weekday")
      const data = await response.json()
      setWeekdayTest(data)
    } catch (error) {
      setWeekdayTest({
        success: false,
        error: error instanceof Error ? error.message : "平日テストに失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const testCronJob = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/cron/lunch")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Cron Jobテストに失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const getHistory = async () => {
    setLoading(true)
    setHistoryData(null)

    try {
      const response = await fetch("/api/history")
      const data = await response.json()
      setHistoryData(data)
    } catch (error) {
      setHistoryData({
        success: false,
        error: error instanceof Error ? error.message : "履歴の取得に失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = async () => {
    if (!confirm("履歴をクリアしますか？この操作は取り消せません。")) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/history", { method: "DELETE" })
      const data = await response.json()

      if (data.success) {
        setHistoryData(null)
        setResult({ success: true, message: "履歴をクリアしました" })
      } else {
        setResult({ success: false, error: data.error })
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "履歴のクリアに失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const getSelectionAnalysis = async () => {
    setLoading(true)
    setAnalysisData(null)

    try {
      const response = await fetch("/api/selection-analysis")
      const data = await response.json()
      setAnalysisData(data)
    } catch (error) {
      setAnalysisData({
        success: false,
        error: error instanceof Error ? error.message : "選択分析の取得に失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const addTestHistory = async () => {
    if (!confirm("テスト用の履歴を追加しますか？")) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/selection-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addTestHistory" }),
      })
      const data = await response.json()

      if (data.success) {
        setResult({ success: true, message: data.message })
      } else {
        setResult({ success: false, error: data.error })
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "テスト履歴の追加に失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const addTestOrders = async () => {
    if (!confirm("テスト用の注文データを追加しますか？")) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addTestData" }),
      })
      const data = await response.json()

      if (data.success) {
        setResult({ success: true, message: data.message })
        // 注文データを再取得
        setTimeout(() => fetchOrders(), 1000)
      } else {
        setResult({ success: false, error: data.error })
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "テスト注文データの追加に失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const clearOrders = async () => {
    if (!confirm("全ての注文セッションをクリアしますか？この操作は取り消せません。")) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/orders", { method: "DELETE" })
      const data = await response.json()

      if (data.success) {
        setOrderData(null)
        setResult({ success: true, message: data.message })
      } else {
        setResult({ success: false, error: data.error })
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "注文データのクリアに失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  /* ---------- レンダー ---------- */
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>ランチ候補 &amp; 注文管理ツール</CardTitle>
          <CardDescription>Slack でランチを選び、注文を取りまとめます</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* --- 注文情報 --- */}
          {orderData && (
            <Alert className={orderData.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {orderData.success ? (
                <ShoppingCart className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>注文状況</AlertTitle>
              <AlertDescription>
                {orderData.success ? (
                  <div className="text-sm">
                    <p>
                      <strong>受付中: </strong>
                      {orderData.isOrderingTime ? "はい" : "いいえ"}
                    </p>
                    {orderData.activeSession ? (
                      <>
                        <p>
                          <strong>店舗:</strong> {orderData.activeSession.restaurant?.name}
                        </p>
                        <p>
                          <strong>注文数:</strong> {orderData.activeSession.orders.length} 件
                        </p>
                      </>
                    ) : (
                      <p>アクティブな注文セッションはありません。</p>
                    )}
                  </div>
                ) : (
                  orderData.error
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* --- 履歴 / 分析 --- */}
          {historyData && (
            <Alert
              className={historyData.success ? "bg-indigo-50 border-indigo-200 mb-4" : "bg-red-50 border-red-200 mb-4"}
            >
              {historyData.success ? (
                <BarChart3 className="h-4 w-4 text-indigo-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>選択履歴・統計</AlertTitle>
              <AlertDescription>
                {historyData.success ? (
                  <div className="text-sm">
                    <p>
                      <strong>総記録数:</strong> {historyData.totalRecords}件
                    </p>

                    {historyData.history?.length > 0 && (
                      <div className="mt-2">
                        <p>
                          <strong>最近の選択:</strong>
                        </p>
                        <div className="text-xs max-h-32 overflow-y-auto">
                          {historyData.history.slice(0, 5).map((h: any, i: number) => (
                            <div key={i} className="flex justify-between">
                              <span>{h.restaurantName}</span>
                              <span className="text-gray-500">
                                {new Date(h.selectedAt).toLocaleDateString("ja-JP")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {Object.keys(historyData.stats?.last7Days || {}).length > 0 && (
                      <div className="mt-2">
                        <p>
                          <strong>今週の人気店:</strong>
                        </p>
                        <div className="text-xs">
                          {Object.entries(historyData.stats.last7Days)
                            .sort(([, a], [, b]) => (b as number) - (a as number))
                            .slice(0, 3)
                            .map(([name, count]) => (
                              <div key={name} className="flex justify-between">
                                <span>{name}</span>
                                <span className="text-gray-500">{count}回</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  historyData.error
                )}
              </AlertDescription>
            </Alert>
          )}

          {analysisData && (
            <Alert
              className={analysisData.success ? "bg-orange-50 border-orange-200 mb-4" : "bg-red-50 border-red-200 mb-4"}
            >
              {analysisData.success ? (
                <BarChart3 className="h-4 w-4 text-orange-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>選択分析・除外ルール</AlertTitle>
              <AlertDescription>
                {analysisData.success ? (
                  <div className="text-sm">
                    <p>
                      <strong>現在の週:</strong> {analysisData.analysis?.currentWeek}週目
                    </p>
                    <p>
                      <strong>営業日番号:</strong> {analysisData.analysis?.currentBusinessDay}
                    </p>

                    {analysisData.analysis?.sameWeekSelections?.length > 0 && (
                      <div className="mt-2">
                        <p>
                          <strong>今週選択済み:</strong>
                        </p>
                        <div className="text-xs text-red-600">
                          {analysisData.analysis.sameWeekSelections.join(", ")}
                        </div>
                      </div>
                    )}

                    {analysisData.analysis?.consecutiveSelections?.length > 0 && (
                      <div className="mt-2">
                        <p>
                          <strong>連続営業日で除外:</strong>
                        </p>
                        <div className="text-xs text-red-600">
                          {analysisData.analysis.consecutiveSelections.join(", ")}
                        </div>
                      </div>
                    )}

                    {analysisData.analysis?.recentSelections?.length > 0 && (
                      <div className="mt-2">
                        <p>
                          <strong>最近7日間の選択:</strong>
                        </p>
                        <div className="text-xs text-gray-600">{analysisData.analysis.recentSelections.join(", ")}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  analysisData.error
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* --- 実行結果 / エラー --- */}
          {result && (
            <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>{result.success ? "成功" : "エラー"}</AlertTitle>
              <AlertDescription>{result.success ? result.message : result.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {/* --- 注文関連 --- */}
          <Button variant="outline" className="w-full bg-transparent" disabled={loading} onClick={fetchOrders}>
            📦 注文状況を取得
          </Button>
          <Button variant="outline" className="w-full bg-transparent" disabled={loading} onClick={collectOrders}>
            📋 注文を取りまとめる
          </Button>
          <Button variant="outline" className="w-full bg-transparent" disabled={loading} onClick={addTestOrders}>
            📋 テスト用注文データを追加
          </Button>
          <Button variant="outline" className="w-full bg-transparent" disabled={loading} onClick={clearOrders}>
            📋 注文データをクリア
          </Button>

          {/* --- ランチ選択 --- */}
          <Button className="w-full" disabled={loading} onClick={triggerLunchPicker}>
            🍽️ ランチを選ぶ（手動）
          </Button>
          <Button variant="outline" className="w-full bg-transparent" disabled={loading} onClick={addTestHistory}>
            📋 テスト用履歴を追加
          </Button>
          <Button variant="outline" className="w-full bg-transparent" disabled={loading} onClick={clearHistory}>
            📋 履歴をクリア
          </Button>

          {/* --- テスト / デバッグ --- */}
          <Button variant="outline" className="w-full bg-transparent" disabled={loading} onClick={testSpreadsheet}>
            📋 スプレッドシート接続をテスト
          </Button>
          <Button variant="outline" className="w-full bg-transparent" disabled={loading} onClick={testSlack}>
            📋 Slack接続をテスト
          </Button>
          <Button variant="outline" className="w-full bg-transparent" disabled={loading} onClick={debugSlack}>
            🐛 Slackデバッグ情報を取得
          </Button>
          <Button variant="outline" className="w-full bg-transparent" disabled={loading} onClick={listWorkspaces}>
            🏢 ワークスペース情報を取得
          </Button>
          <Button variant="outline" className="w-full bg-transparent" disabled={loading} onClick={testWebhook}>
            📋 Webhookエンドポイントをテスト
          </Button>
          <Button variant="outline" className="w-full bg-transparent" disabled={loading} onClick={testWeekday}>
            📅 平日・祝日チェックをテスト
          </Button>
          <Button variant="outline" className="w-full bg-transparent" disabled={loading} onClick={testCronJob}>
            🕒 Cron Jobをテスト
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}

"use client"

import { CardFooter } from "@/components/ui/card"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Bug, Building, Calendar, BarChart3 } from "lucide-react"

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [slackTestResult, setSlackTestResult] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [workspaceInfo, setWorkspaceInfo] = useState<any>(null)
  const [webhookTest, setWebhookTest] = useState<any>(null)
  const [weekdayTest, setWeekdayTest] = useState<any>(null)
  const [historyData, setHistoryData] = useState<any>(null)
  const [selectionAnalysis, setSelectionAnalysis] = useState<any>(null)

  const triggerLunchPicker = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/lunch-picker")
      const data = await response.json()

      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "不明なエラーが発生しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const testSpreadsheet = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/test-sheets")
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : "テストに失敗しました",
      })
    } finally {
      setLoading(false)
    }
  }

  const testSlack = async () => {
    setLoading(true)
    setSlackTestResult(null)

    try {
      const response = await fetch("/api/test-slack")
      const data = await response.json()
      setSlackTestResult(data)
    } catch (error) {
      setSlackTestResult({
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
    setSelectionAnalysis(null)

    try {
      const response = await fetch("/api/selection-analysis")
      const data = await response.json()
      setSelectionAnalysis(data)
    } catch (error) {
      setSelectionAnalysis({
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ランチ候補選択ツール</CardTitle>
          <CardDescription>平日AM9:00に自動でGoogle Sheetsからお店を選んでSlackに通知</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">まずは各種テストを実行して設定を確認してください。</p>

          {/* 履歴データ表示 */}
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

          {/* 選択分析結果 */}
          {selectionAnalysis && (
            <Alert
              className={
                selectionAnalysis.success ? "bg-orange-50 border-orange-200 mb-4" : "bg-red-50 border-red-200 mb-4"
              }
            >
              {selectionAnalysis.success ? (
                <BarChart3 className="h-4 w-4 text-orange-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>選択分析・除外ルール</AlertTitle>
              <AlertDescription>
                {selectionAnalysis.success ? (
                  <div className="text-sm">
                    <p>
                      <strong>現在の週:</strong> {selectionAnalysis.analysis?.currentWeek}週目
                    </p>
                    <p>
                      <strong>営業日番号:</strong> {selectionAnalysis.analysis?.currentBusinessDay}
                    </p>

                    {selectionAnalysis.analysis?.sameWeekSelections?.length > 0 && (
                      <div className="mt-2">
                        <p>
                          <strong>今週選択済み:</strong>
                        </p>
                        <div className="text-xs text-red-600">
                          {selectionAnalysis.analysis.sameWeekSelections.join(", ")}
                        </div>
                      </div>
                    )}

                    {selectionAnalysis.analysis?.consecutiveSelections?.length > 0 && (
                      <div className="mt-2">
                        <p>
                          <strong>連続営業日で除外:</strong>
                        </p>
                        <div className="text-xs text-red-600">
                          {selectionAnalysis.analysis.consecutiveSelections.join(", ")}
                        </div>
                      </div>
                    )}

                    {selectionAnalysis.analysis?.recentSelections?.length > 0 && (
                      <div className="mt-2">
                        <p>
                          <strong>最近7日間の選択:</strong>
                        </p>
                        <div className="text-xs text-gray-600">
                          {selectionAnalysis.analysis.recentSelections.join(", ")}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  selectionAnalysis.error
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* 平日テスト結果 */}
          {weekdayTest && (
            <Alert
              className={weekdayTest.success ? "bg-blue-50 border-blue-200 mb-4" : "bg-red-50 border-red-200 mb-4"}
            >
              <Calendar className="h-4 w-4 text-blue-600" />
              <AlertTitle>平日・祝日チェック</AlertTitle>
              <AlertDescription>
                {weekdayTest.success ? (
                  <div className="text-sm">
                    <p>
                      <strong>現在:</strong> {weekdayTest.currentDate}
                    </p>
                    <p>
                      <strong>状態:</strong> {weekdayTest.message}
                    </p>
                    {weekdayTest.nextWeekday && (
                      <p>
                        <strong>次の平日:</strong> {weekdayTest.nextWeekday}
                      </p>
                    )}
                    <div className="mt-2">
                      <p>
                        <strong>今週の予定:</strong>
                      </p>
                      <div className="text-xs">
                        {weekdayTest.weekDays?.map((day: any) => (
                          <div key={day.date} className={day.isWeekday ? "text-green-600" : "text-gray-500"}>
                            {day.date} ({day.dayName}) -{" "}
                            {day.isWeekday ? "実行" : `休み${day.holidayName ? `(${day.holidayName})` : ""}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  weekdayTest.error
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Webhookテスト結果 */}
          {webhookTest && (
            <Alert
              className={webhookTest.success ? "bg-green-50 border-green-200 mb-4" : "bg-red-50 border-red-200 mb-4"}
            >
              {webhookTest.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>Webhookテスト</AlertTitle>
              <AlertDescription>
                {webhookTest.success ? (
                  <div>
                    <p>✅ エンドポイント動作確認</p>
                    <p className="text-xs mt-1">URL: {webhookTest.webhookUrl}</p>
                    <p className="text-xs">このURLをSlack APIのRequest URLに設定してください</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-red-600">{webhookTest.message}</p>
                    <p className="text-xs mt-1">エラー: {webhookTest.error}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* ワークスペース情報 */}
          {workspaceInfo && (
            <Alert
              className={
                workspaceInfo.success ? "bg-purple-50 border-purple-200 mb-4" : "bg-red-50 border-red-200 mb-4"
              }
            >
              {workspaceInfo.success ? (
                <Building className="h-4 w-4 text-purple-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>ワークスペース情報</AlertTitle>
              <AlertDescription>
                {workspaceInfo.success ? (
                  <div className="text-sm">
                    <p>
                      <strong>ワークスペース:</strong> {workspaceInfo.workspace?.name}
                    </p>
                    <p>
                      <strong>Bot名:</strong> {workspaceInfo.bot?.name}
                    </p>
                    <p>
                      <strong>参加チャンネル数:</strong> {workspaceInfo.channels?.length}
                    </p>
                    {workspaceInfo.channels?.length > 0 && (
                      <div className="mt-2">
                        <p>
                          <strong>参加中のチャンネル:</strong>
                        </p>
                        <ul className="list-disc list-inside ml-2">
                          {workspaceInfo.channels.map((channel: any) => (
                            <li
                              key={channel.id}
                              className={
                                channel.id === workspaceInfo.currentChannelId ? "font-bold text-green-600" : ""
                              }
                            >
                              #{channel.name} ({channel.id})
                              {channel.id === workspaceInfo.currentChannelId && " ← 現在の設定"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  workspaceInfo.error
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* スプレッドシートテスト結果 */}
          {testResult && (
            <Alert className={testResult.success ? "bg-blue-50 border-blue-200 mb-4" : "bg-red-50 border-red-200 mb-4"}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-blue-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>スプレッドシートテスト</AlertTitle>
              <AlertDescription>
                {testResult.success ? (
                  <div>
                    <p>✅ 接続成功</p>
                    <p>📊 レストラン数: {testResult.restaurantCount}</p>
                    <p>📋 シート名: {testResult.structure?.sheets?.[0]?.name}</p>
                  </div>
                ) : (
                  testResult.error
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Slackテスト結果 */}
          {slackTestResult && (
            <Alert
              className={
                slackTestResult.success ? "bg-green-50 border-green-200 mb-4" : "bg-red-50 border-red-200 mb-4"
              }
            >
              {slackTestResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>Slackテスト</AlertTitle>
              <AlertDescription>
                {slackTestResult.success ? (
                  <div>
                    <p>✅ Slack接続成功</p>
                    <p>🤖 Bot: {slackTestResult.botInfo?.user}</p>
                    <p>📢 チャンネル: #{slackTestResult.channelInfo?.name}</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-red-600">{slackTestResult.error}</p>
                    {slackTestResult.suggestions && (
                      <div className="mt-2">
                        <p className="font-medium">解決方法:</p>
                        <ul className="list-disc list-inside text-sm">
                          {slackTestResult.suggestions.map((suggestion: string, index: number) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* デバッグ情報 */}
          {debugInfo && (
            <Alert className="bg-yellow-50 border-yellow-200 mb-4">
              <Bug className="h-4 w-4 text-yellow-600" />
              <AlertTitle>デバッグ情報</AlertTitle>
              <AlertDescription>
                <div className="text-xs font-mono overflow-auto max-h-60">
                  <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* 実行結果 */}
          {result && (
            <Alert className={result.success ? "bg-green-50 border-green-200 mb-4" : "bg-red-50 border-red-200 mb-4"}>
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
          <Button onClick={getHistory} disabled={loading} variant="outline" className="w-full bg-transparent">
            {loading ? "取得中..." : "📊 選択履歴・統計を見る"}
          </Button>
          <Button onClick={getSelectionAnalysis} disabled={loading} variant="outline" className="w-full bg-transparent">
            {loading ? "分析中..." : "🔍 選択分析・除外ルール確認"}
          </Button>
          <Button
            onClick={addTestHistory}
            disabled={loading}
            variant="outline"
            className="w-full bg-transparent text-blue-600 hover:text-blue-700"
          >
            {loading ? "追加中..." : "🧪 テスト履歴を追加"}
          </Button>
          {historyData?.success && historyData.totalRecords > 0 && (
            <Button
              onClick={clearHistory}
              disabled={loading}
              variant="outline"
              className="w-full bg-transparent text-red-600 hover:text-red-700"
            >
              {loading ? "クリア中..." : "🗑️ 履歴をクリア"}
            </Button>
          )}
          <Button onClick={testWeekday} disabled={loading} variant="outline" className="w-full bg-transparent">
            {loading ? "チェック中..." : "📅 平日・祝日チェック"}
          </Button>
          <Button onClick={testCronJob} disabled={loading} variant="outline" className="w-full bg-transparent">
            {loading ? "テスト中..." : "⏰ 定期実行テスト"}
          </Button>
          <Button onClick={testWebhook} disabled={loading} variant="outline" className="w-full bg-transparent">
            {loading ? "テスト中..." : "🔗 Webhookエンドポイントテスト"}
          </Button>
          <Button onClick={listWorkspaces} disabled={loading} variant="outline" className="w-full bg-transparent">
            {loading ? "確認中..." : "🏢 ワークスペース・チャンネル確認"}
          </Button>
          <Button onClick={testSpreadsheet} disabled={loading} variant="outline" className="w-full bg-transparent">
            {loading ? "テスト中..." : "📊 スプレッドシート接続テスト"}
          </Button>
          <Button onClick={testSlack} disabled={loading} variant="outline" className="w-full bg-transparent">
            {loading ? "テスト中..." : "💬 Slack接続テスト"}
          </Button>
          <Button onClick={debugSlack} disabled={loading} variant="outline" className="w-full bg-transparent">
            {loading ? "デバッグ中..." : "🐞 Slackデバッグ情報"}
          </Button>
          <Button onClick={triggerLunchPicker} disabled={loading} className="w-full">
            {loading ? "ランチを選んでいます..." : "🍽️ ランチを選ぶ（手動実行）"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}

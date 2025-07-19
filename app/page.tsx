"use client"

import { CardFooter } from "@/components/ui/card"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Bug, Building } from "lucide-react"

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [slackTestResult, setSlackTestResult] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [workspaceInfo, setWorkspaceInfo] = useState<any>(null)
  const [webhookTest, setWebhookTest] = useState<any>(null)

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

      // 現在のURLを取得
      const currentUrl = window.location.origin
      const webhookUrl = `${currentUrl}/api/slack-webhook`

      setWebhookTest({
        success: getResponse.ok,
        status: getResponse.status,
        webhookUrl,
        response: getData,
        message: getResponse.ok
          ? "Webhookエンドポイントが正常に動作しています"
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ランチ候補選択ツール</CardTitle>
          <CardDescription>Google Sheetsからランダムにお店を選んでSlackに通知します</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">まずは各種テストを実行して設定を確認してください。</p>

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
            {loading ? "ランチを選んでいます..." : "🍽️ ランチを選ぶ"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}

"use client"

import { CardFooter } from "@/components/ui/card"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [slackTestResult, setSlackTestResult] = useState<any>(null)

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ランチ候補選択ツール</CardTitle>
          <CardDescription>Google Sheetsからランダムにお店を選んでSlackに通知します</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">まずは各種テストを実行して設定を確認してください。</p>

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
          <Button onClick={testSpreadsheet} disabled={loading} variant="outline" className="w-full">
            {loading ? "テスト中..." : "📊 スプレッドシート接続テスト"}
          </Button>
          <Button onClick={testSlack} disabled={loading} variant="outline" className="w-full">
            {loading ? "テスト中..." : "💬 Slack接続テスト"}
          </Button>
          <Button onClick={triggerLunchPicker} disabled={loading} className="w-full">
            {loading ? "ランチを選んでいます..." : "🍽️ ランチを選ぶ"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ランチ候補選択ツール</CardTitle>
          <CardDescription>Google Sheetsからランダムにお店を選んでSlackに通知します</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">
            「ランチを選ぶ」ボタンをクリックすると、スプレッドシートからランダムにお店を選んでSlackチャンネルに通知します。
          </p>

          {result && (
            <Alert className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>{result.success ? "成功" : "エラー"}</AlertTitle>
              <AlertDescription>{result.success ? result.message : result.error}</AlertDescription>
            </Alert>
          )}
          {testResult && (
            <Alert className={testResult.success ? "bg-blue-50 border-blue-200 mt-4" : "bg-red-50 border-red-200 mt-4"}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-blue-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>スプレッドシートテスト結果</AlertTitle>
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
        </CardContent>
        <CardFooter>
          <Button onClick={testSpreadsheet} disabled={loading} variant="outline" className="w-full mb-2">
            {loading ? "テスト中..." : "スプレッドシート接続テスト"}
          </Button>
          <Button onClick={triggerLunchPicker} disabled={loading} className="w-full">
            {loading ? "ランチを選んでいます..." : "ランチを選ぶ"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}

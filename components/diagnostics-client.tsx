"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { testThrillApiAction, clearLeaderboardCacheAction } from "@/app/actions/admin-actions"

export function DiagnosticsClient() {
  const [testing, setTesting] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleTestApi = async () => {
    setTesting(true)
    setResult(null)

    try {
      const response = await testThrillApiAction()
      setResult(response)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setTesting(false)
    }
  }

  const handleClearAndRefresh = async () => {
    setClearing(true)
    setResult(null)

    try {
      // Clear cache first
      const clearResult = await clearLeaderboardCacheAction()

      if (!clearResult.success) {
        setResult(clearResult)
        setClearing(false)
        return
      }

      // Then test API
      const testResult = await testThrillApiAction()
      setResult({
        ...testResult,
        cacheCleared: true,
      })
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Leaderboard Diagnostics</h1>
        <p className="text-muted-foreground">Test the Thrill API connection and clear cached data</p>
      </div>

      <div className="grid gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Test and troubleshoot the leaderboard system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={handleTestApi} disabled={testing || clearing} className="flex-1">
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Test Thrill API
                  </>
                )}
              </Button>

              <Button
                onClick={handleClearAndRefresh}
                disabled={testing || clearing}
                variant="destructive"
                className="flex-1"
              >
                {clearing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear Cache & Test
                  </>
                )}
              </Button>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Test Thrill API:</strong> Checks if your THRILL_API_TOKEN is valid and working
                <br />
                <strong>Clear Cache & Test:</strong> Deletes all cached leaderboard data and tests the API
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Success
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    Error
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.cacheCleared && (
                <Alert className="mb-4">
                  <AlertDescription>✓ Cache cleared successfully</AlertDescription>
                </Alert>
              )}

              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">{JSON.stringify(result, null, 2)}</pre>

              {result.data?.response?.items && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Found {result.data.response.items.length} players</h3>
                  <div className="space-y-2">
                    {result.data.response.items.slice(0, 5).map((item: any, i: number) => (
                      <div key={i} className="text-sm">
                        {i + 1}. {item.username} - Wager: {item.wager?.value || "0"}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-1">If the API test fails:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Check that THRILL_API_TOKEN is set in environment variables</li>
              <li>Verify the token is not expired (get a new one from Thrill.com)</li>
              <li>Check the response status code and error message</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-1">If the API test succeeds but leaderboard is stale:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Click "Clear Cache & Test" to force a refresh</li>
              <li>Go to the leaderboard page and click "Refresh Data" (admin only)</li>
              <li>Check if the Thrill API itself has updated data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

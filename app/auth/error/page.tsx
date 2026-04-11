import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card style={{ background: "#010101", border: "0.5px solid rgba(255,255,255,0.5)" }}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-400">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {params?.error ? (
              <p className="text-white/80">Error: {params.error}</p>
            ) : (
              <p className="text-white/80">An unexpected error occurred during authentication.</p>
            )}
            <Button asChild className="w-full bg-[#5cfec0] text-black hover:bg-[#4de8ad] font-bold">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-[#111] border-[#222]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-[#5cfec0]">Check Your Email</CardTitle>
            <CardDescription className="text-gray-400">We've sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Thank you for signing up! Please check your email and click the confirmation link to activate your
              account.
            </p>
            <p className="text-sm text-gray-400">
              Once confirmed, you'll be able to log in and access your personal dashboard.
            </p>
            <Button asChild className="w-full bg-[#5cfec0] text-black hover:bg-[#4de8ad] font-bold">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

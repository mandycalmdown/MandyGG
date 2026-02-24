import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardClient } from "@/components/dashboard-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Degen Dashboard",
  description:
    "Track your wager stats, XP progress, and poker qualifications. Your personal hub for Mandy.gg rewards and competitions.",
  robots: "noindex, nofollow", // Private page, don't index
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return <DashboardClient user={user} profile={profile} />
}

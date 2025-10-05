import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboardClient } from "@/components/admin-dashboard-client"
import { AdminPasswordGate } from "@/components/admin-password-gate"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch all user profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (profilesError) {
    console.error("[v0] Error fetching profiles:", profilesError)
  }

  return (
    <AdminPasswordGate>
      <AdminDashboardClient user={user} profiles={profiles || []} />
    </AdminPasswordGate>
  )
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminUserDashboard } from "@/components/admin-user-dashboard"
import { AdminPasswordGate } from "@/components/admin-password-gate"

export default async function AdminUserViewPage({ params }: { params: { userId: string } }) {
  const supabase = await createClient()

  const {
    data: { user: currentUser },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !currentUser) {
    redirect("/auth/login")
  }

  const { data: targetProfile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.userId)
    .single()

  if (profileError || !targetProfile) {
    redirect("/admin")
  }

  return (
    <AdminPasswordGate>
      <AdminUserDashboard profile={targetProfile} />
    </AdminPasswordGate>
  )
}

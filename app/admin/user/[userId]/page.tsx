import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminUserDashboard } from "@/components/admin-user-dashboard"

export default async function AdminUserViewPage({ params }: { params: { userId: string } }) {
  const supabase = await createClient()

  // Check if current user is admin
  const {
    data: { user: currentUser },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !currentUser) {
    redirect("/auth/login")
  }

  const { data: currentProfile } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()

  if (!currentProfile?.is_admin) {
    redirect("/dashboard")
  }

  // Fetch the target user's profile
  const { data: targetProfile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.userId)
    .single()

  if (profileError || !targetProfile) {
    redirect("/admin")
  }

  return <AdminUserDashboard profile={targetProfile} />
}

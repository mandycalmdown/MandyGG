import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminPasswordGate } from "@/components/admin-password-gate"
import { DiagnosticsClient } from "@/components/diagnostics-client"

export default async function DiagnosticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  return (
    <AdminPasswordGate>
      <DiagnosticsClient />
    </AdminPasswordGate>
  )
}

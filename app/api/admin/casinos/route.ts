import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: casinos, error } = await supabase
    .from("casinos")
    .select("*")
    .order("sort_order", { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ casinos })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const body = await req.json()
  const { name, description, referral_url, logo_url, sort_order, is_active } = body
  if (!name || !referral_url) {
    return NextResponse.json({ error: "name and referral_url are required" }, { status: 400 })
  }
  const { error } = await supabase.from("casinos").insert({
    name, description, referral_url, logo_url, sort_order: sort_order ?? 0, is_active: is_active ?? true,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PUT(req: Request) {
  const supabase = await createClient()
  const body = await req.json()
  const { id, name, description, referral_url, logo_url, sort_order, is_active } = body
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  const { error } = await supabase.from("casinos").update({
    name, description, referral_url, logo_url, sort_order, is_active, updated_at: new Date().toISOString(),
  }).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  const { error } = await supabase.from("casinos").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

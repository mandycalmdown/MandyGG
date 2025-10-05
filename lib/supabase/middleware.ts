import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const isPublicPath =
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/rewards") ||
    request.nextUrl.pathname.startsWith("/leaderboard") ||
    request.nextUrl.pathname.startsWith("/tutorials") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname === "/"

  // For public paths, skip auth check entirely
  if (isPublicPath) {
    console.log("[v0] Public path, skipping auth check:", request.nextUrl.pathname)
    return NextResponse.next({
      request,
    })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""

  console.log("[v0] Middleware running for protected path:", request.nextUrl.pathname)
  console.log("[v0] Supabase URL length:", supabaseUrl.length)
  console.log("[v0] Supabase Anon Key length:", supabaseAnonKey.length)

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.length === 0 || supabaseAnonKey.length === 0) {
    console.log("[v0] Supabase credentials missing or empty, allowing access")
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  // IMPORTANT: Do not run code between createServerClient and supabase.auth.getUser()
  // This refreshes the user's session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] User authenticated:", !!user)

  if (!user) {
    console.log("[v0] Redirecting to login")
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

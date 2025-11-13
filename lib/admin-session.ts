"use client"

const ADMIN_SESSION_KEY = "admin_session_token"
const ADMIN_SESSION_EXPIRY = "admin_session_expiry"

export function setAdminSession() {
  const expiryTime = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  sessionStorage.setItem(ADMIN_SESSION_KEY, "authenticated")
  sessionStorage.setItem(ADMIN_SESSION_EXPIRY, expiryTime.toString())
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY)
  sessionStorage.removeItem(ADMIN_SESSION_EXPIRY)
}

export function isAdminSessionValid(): boolean {
  const token = sessionStorage.getItem(ADMIN_SESSION_KEY)
  const expiry = sessionStorage.getItem(ADMIN_SESSION_EXPIRY)

  if (!token || !expiry) {
    return false
  }

  const expiryTime = Number.parseInt(expiry, 10)
  if (Date.now() > expiryTime) {
    clearAdminSession()
    return false
  }

  return true
}

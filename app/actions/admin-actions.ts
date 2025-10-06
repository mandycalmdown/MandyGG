"use server"

// Server-side admin key validation
function validateAdminKey(): boolean {
  // In a production environment, you should validate the admin session
  // For now, we'll use the server-side ADMIN_UNLINK_KEY
  return !!process.env.ADMIN_UNLINK_KEY
}

export async function unlinkUserAction(userId: string) {
  if (!validateAdminKey()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/users/unlink`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, adminKey: process.env.ADMIN_UNLINK_KEY }),
    })

    const data = await response.json()
    return { success: response.ok, data, error: data.error }
  } catch (error) {
    return { success: false, error: "Failed to unlink user" }
  }
}

export async function resetUserAction(userId: string) {
  if (!validateAdminKey()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/users/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, adminKey: process.env.ADMIN_UNLINK_KEY }),
    })

    const data = await response.json()
    return { success: response.ok, data, error: data.error }
  } catch (error) {
    return { success: false, error: "Failed to reset user" }
  }
}

export async function toggleVerificationAction(userId: string, verified: boolean) {
  if (!validateAdminKey()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/users/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, verified, adminKey: process.env.ADMIN_UNLINK_KEY }),
    })

    const data = await response.json()
    return { success: response.ok, data, error: data.error }
  } catch (error) {
    return { success: false, error: "Failed to update verification" }
  }
}

export async function toggleLockAction(userId: string, locked: boolean) {
  if (!validateAdminKey()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/users/lock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, locked, adminKey: process.env.ADMIN_UNLINK_KEY }),
    })

    const data = await response.json()
    return { success: response.ok, data, error: data.error }
  } catch (error) {
    return { success: false, error: "Failed to update lock status" }
  }
}

export async function deleteUserAction(userId: string) {
  if (!validateAdminKey()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/users/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, adminKey: process.env.ADMIN_UNLINK_KEY }),
    })

    const data = await response.json()
    return { success: response.ok, data, error: data.error }
  } catch (error) {
    return { success: false, error: "Failed to delete user" }
  }
}

export async function captureQualifiersAction() {
  if (!validateAdminKey()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/poker-qualifiers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminKey: process.env.ADMIN_UNLINK_KEY }),
    })

    const data = await response.json()
    return { success: response.ok, data, error: data.error }
  } catch (error) {
    return { success: false, error: "Failed to capture qualifiers" }
  }
}

export async function unlinkAllAccountsAction() {
  if (!validateAdminKey()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/unlink-all-accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminKey: process.env.ADMIN_UNLINK_KEY }),
    })

    const data = await response.json()
    return { success: response.ok, data, error: data.error }
  } catch (error) {
    return { success: false, error: "Failed to unlink all accounts" }
  }
}

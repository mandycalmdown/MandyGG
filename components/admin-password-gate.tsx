"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock } from "lucide-react"
import { setAdminSession, isAdminSessionValid } from "@/lib/admin-session"

interface AdminPasswordGateProps {
  children: React.ReactNode
}

export function AdminPasswordGate({ children }: AdminPasswordGateProps) {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isAdminSessionValid()) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123"

    if (password === adminPassword) {
      setIsAuthenticated(true)
      setAdminSession()
    } else {
      setError("Incorrect password. Please try again.")
      setPassword("")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card
          className="w-full max-w-md p-8 rounded-2xl border border-[#14b8a6]/50"
          style={{
            backgroundColor: "rgba(10, 10, 10, 0.95)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.25), 0 0 40px rgba(20, 184, 166, 0.15)",
          }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#14b8a6]/20 mb-4">
              <Lock className="h-8 w-8 text-[#14b8a6]" />
            </div>
            <h1 className="text-3xl font-bold text-[#14b8a6] uppercase mb-2">Admin Access</h1>
            <p className="text-gray-400">Enter the admin password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#1a1a1a] border-[#333] text-white text-lg py-6"
                autoFocus
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#14b8a6] hover:bg-[#0d9488] text-black font-bold uppercase text-lg py-6 rounded-xl transition-all duration-300"
            >
              Access Admin Dashboard
            </Button>
          </form>

          <p className="text-gray-500 text-xs text-center mt-6">
            Default password: admin123 (can be changed via NEXT_PUBLIC_ADMIN_PASSWORD env variable)
          </p>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

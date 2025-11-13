"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

export default function MailingListForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setMessage("")

    try {
      // TODO: Implement mailing list API endpoint
      // For now, just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStatus("success")
      setMessage("Thanks for subscribing! Check your email to confirm.")
      setEmail("")

      // Reset status after 5 seconds
      setTimeout(() => {
        setStatus("idle")
        setMessage("")
      }, 5000)
    } catch (error) {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")

      // Reset status after 5 seconds
      setTimeout(() => {
        setStatus("idle")
        setMessage("")
      }, 5000)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-lg md:text-xl font-bold text-white mb-3 uppercase text-center">Stay Updated</h3>
      <p className="text-sm text-gray-300 mb-4 text-center">
        Subscribe to get the latest news, promotions, and updates
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === "loading"}
            className="pl-10 bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-500"
          />
        </div>
        <Button
          type="submit"
          disabled={status === "loading"}
          className="bg-[#5cfec0] text-black hover:bg-[#4de8ad] font-bold rounded-xl uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>

      {message && (
        <p className={`text-sm mt-3 text-center ${status === "success" ? "text-[#5cfec0]" : "text-red-400"}`}>
          {message}
        </p>
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

export function MailingListForm() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/subscribe-mailing-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, source: "footer" }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe")
      }

      setMessage({ type: "success", text: data.message })
      setEmail("")
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to subscribe",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-6 max-w-md mx-auto">
      <h3 className="text-lg md:text-xl font-bold text-white mb-3 uppercase text-center">Join Our Mailing List</h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[#1a1a1a] border-[#333] text-white pl-10 placeholder:text-gray-500"
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#5cfec0] text-black hover:bg-[#4de8ad] font-bold rounded-xl uppercase"
        >
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
      {message && (
        <p className={`text-sm mt-2 text-center ${message.type === "success" ? "text-[#5cfec0]" : "text-red-400"}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}

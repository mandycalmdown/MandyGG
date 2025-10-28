"use client"

import { SiteNavigation } from "@/components/site-navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ExternalLink, CheckCircle2, AlertCircle } from "lucide-react"
import Image from "next/image"

export function HowToJoinPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white">
      <SiteNavigation currentPage="how-to-join" />

      {/* Hero Section */}
      <section className="relative px-4 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
            How to Join{" "}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Thrill</span>
          </h1>
          <p className="mt-6 text-lg text-gray-300 text-balance md:text-xl">
            Follow these simple steps to join Thrill.com with code{" "}
            <span className="font-bold text-teal-400">MANDY</span> and unlock exclusive rewards
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl space-y-24">
          {/* Step 1 */}
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-4 py-2 text-sm font-semibold text-teal-400 mb-6">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-black">
                  1
                </span>
                STEP ONE
              </div>
              <h2 className="text-3xl font-bold mb-4 md:text-4xl">Visit Thrill with Code MANDY</h2>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                Click the button below to navigate to Thrill.com. It's crucial to use this specific link to ensure
                you're registered under code <span className="font-bold text-teal-400">MANDY</span> and eligible for all
                exclusive rewards.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Use the referral link to be automatically tagged</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Must be 18 years or older to participate</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Have a valid email address ready</p>
                </div>
              </div>
              <Button
                size="lg"
                className="mt-8 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-black font-bold"
                asChild
              >
                <a
                  href="https://thrill.com/?r=MANDY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  Visit Thrill.com
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300" />
                {/* Floating card */}
                <Card className="relative overflow-hidden border-teal-500/20 bg-gray-900/50 backdrop-blur-sm transform group-hover:-translate-y-2 transition-all duration-300">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MANDYGG_THRILL_SIGNIN-GvVh7UcvG6FSOySsvJxG5W2ainkDeG.webp"
                    alt="Thrill.com homepage showing sign up button"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                </Card>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
            <div className="order-1">
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300" />
                {/* Floating card */}
                <Card className="relative overflow-hidden border-purple-500/20 bg-gray-900/50 backdrop-blur-sm transform group-hover:-translate-y-2 transition-all duration-300">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MANDYGG_THRILL_EMAIL-7olOHo1bU39StlzoGx3Um123Osi87x.webp"
                    alt="Thrill sign up form with email input"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                </Card>
              </div>
            </div>
            <div className="order-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-400 mb-6">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-black">
                  2
                </span>
                STEP TWO
              </div>
              <h2 className="text-3xl font-bold mb-4 md:text-4xl">Complete Sign Up Process</h2>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                Click the <span className="font-bold text-purple-400">SIGN UP</span> button and follow the registration
                process. Enter your email address and complete all required fields to create your account.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Click "SIGN UP" in the top right corner</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Enter your email and create a secure password</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Complete all required registration fields</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-4 py-2 text-sm font-semibold text-teal-400 mb-6">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-black">
                  3
                </span>
                STEP THREE
              </div>
              <h2 className="text-3xl font-bold mb-4 md:text-4xl">Verify Your Referral Code</h2>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                After signing up, click on your profile and verify that you are referred by{" "}
                <span className="font-bold text-teal-400">mandycalmdown</span>. This is crucial for reward eligibility.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Click on your profile icon in the top right</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Look for "Referred by mandycalmdown" text</p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">
                    <span className="font-bold text-amber-400">Important:</span> If you don't see this, contact support
                    immediately
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-300" />
                {/* Floating card */}
                <Card className="relative overflow-hidden border-teal-500/20 bg-gray-900/50 backdrop-blur-sm transform group-hover:-translate-y-2 transition-all duration-300">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MANDYGG_THRILL_PROFILE-ncSzOSRwFXmi21jZD7PNJHhS3Geuxf.webp"
                    alt="Thrill profile showing referred by mandycalmdown"
                    width={800}
                    height={400}
                    className="w-full h-auto"
                  />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl">
          <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm">
            <div className="p-8 md:p-12">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-amber-400">Critical: Verify Before Depositing</h3>
                  <p className="text-gray-200 text-lg leading-relaxed mb-4">
                    If your profile does not show "Referred by mandycalmdown", you{" "}
                    <span className="font-bold">MUST</span> contact Thrill support before making any deposits or wagers.
                    Otherwise, you will not be under code MANDY and will not be eligible for any rewards, cash drops, or
                    leaderboard prizes.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Contact support through the Thrill website or reach out to the MandyGG community for assistance.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6 md:text-4xl">Ready to Get Started?</h2>
          <p className="text-gray-300 text-lg mb-8 text-balance">
            Join the MandyGG community today and start earning exclusive rewards
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-black font-bold text-lg px-8 py-6"
            asChild
          >
            <a
              href="https://thrill.com/?r=MANDY"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Join with Code MANDY
              <ExternalLink className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}

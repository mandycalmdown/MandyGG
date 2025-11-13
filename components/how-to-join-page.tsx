"use client"

import { SiteNavigation } from "@/components/site-navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ExternalLink, CheckCircle2, AlertCircle } from "lucide-react"
import Image from "next/image"

export function HowToJoinPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <SiteNavigation currentPage="how-to-join" />

      {/* Hero Section */}
      <section className="relative px-4 pt-24 pb-16 md:pt-32 md:pb-24 bg-black">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
            How to Join{" "}
            <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-teal-400">Thrill</span>
          </h1>
          <p className="mt-6 text-lg text-gray-300 text-balance md:text-xl">
            Follow these steps to join Thrill.com with code <span className="font-bold text-indigo-400">MANDY</span> and
            unlock exclusive rewards
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
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-400 text-xs font-bold text-black">
                  1
                </span>
                STEP ONE
              </div>
              <h2 className="text-3xl font-bold mb-4 md:text-4xl">Visit Thrill with Code MANDY</h2>
              <p className="text-lg mb-6 leading-relaxed text-gray-300">
                Click the button below to open Thrill.com. Make sure to use this specific link so you're registered
                under code <span className="font-bold text-teal-400">MANDY</span> and eligible for all exclusive
                rewards.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Use the referral link to sign up</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Must be 18 years or older to participate</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">Have a valid email address</p>
                </div>
              </div>
              <Button size="lg" className="mt-8 bg-teal-400 hover:bg-teal-500 text-black font-bold" asChild>
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
              <div className="relative animate-float">
                <div className="absolute -inset-8 bg-teal-400/40 rounded-3xl blur-3xl" />
                <div className="relative">
                  <Image
                    src="/images/design-mode/MANDYGG_THRILL_SIGNIN(1).webp"
                    alt="Thrill.com homepage showing sign up button"
                    width={800}
                    height={600}
                    className="w-full h-auto relative z-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
            <div className="order-1">
              <div className="relative animate-float-delayed">
                <div className="absolute -inset-8 bg-indigo-400/40 rounded-3xl blur-3xl" />
                <div className="relative">
                  <Image
                    src="/images/design-mode/MANDYGG_THRILL_EMAIL(1).webp"
                    alt="Thrill sign up form with email input"
                    width={800}
                    height={600}
                    className="w-full h-auto relative z-10"
                  />
                </div>
              </div>
            </div>
            <div className="order-2">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold mb-6 text-indigo-400 bg-indigo-500/10">
                <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-black bg-indigo-400">
                  2
                </span>
                STEP TWO
              </div>
              <h2 className="text-3xl font-bold mb-4 md:text-4xl">Complete Sign Up Process</h2>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                Click the <span className="font-bold text-indigo-400">SIGN UP</span> button and follow the registration
                process. Enter your email address and complete all required fields to create your account.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-indigo-400" />
                  <p className="text-gray-300">Click "SIGN UP" in the top right corner</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-indigo-400" />
                  <p className="text-gray-300">Enter your email and create a secure password</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-indigo-400" />
                  <p className="text-gray-300">Complete all required registration fields</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-4 py-2 text-sm font-semibold text-teal-400 mb-6">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-400 text-xs font-bold text-black">
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
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-rose-400" />
                  <p className="text-gray-300">
                    <span className="font-bold text-rose-400">Important:</span> If you don't see this, contact support
                    immediately
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative animate-float">
                <div className="absolute -inset-8 bg-teal-400/40 rounded-3xl blur-3xl" />
                <div className="relative">
                  <Image
                    src="/images/design-mode/MANDYGG_THRILL_PROFILE(1).webp"
                    alt="Thrill profile showing referred by mandycalmdown"
                    width={800}
                    height={400}
                    className="w-full h-auto relative z-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl">
          <Card className="bg-rose-500/5 backdrop-blur-sm border-rose-400/50 relative">
            <div className="absolute -inset-1 bg-rose-400/20 rounded-xl blur-xl" />
            <div className="relative p-8 md:p-12">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 flex-shrink-0 mt-1 text-rose-400" />
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-rose-400">Critical: Verify Before Depositing</h3>
                  <p className="text-lg leading-relaxed mb-4 text-gray-300">
                    If your profile does not show "Referred by mandycalmdown" you{" "}
                    <span className="font-bold text-white">MUST</span> contact Thrill support before making any deposits
                    or wagers. Otherwise, you will not be under code MANDY and will not be eligible for any rewards,
                    cash drops, or leaderboard prizes.
                  </p>
                  <p className="leading-relaxed text-gray-300">
                    Contact support through the live chat option on the Thrill website
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
          <Button size="lg" className="hover:bg-teal-500 text-black font-bold text-lg px-8 py-6 bg-indigo-400" asChild>
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

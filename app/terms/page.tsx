import type { Metadata } from "next"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the Mandy.gg Terms of Service. Understand your rights and responsibilities when using our platform for crypto casino rewards and leaderboard tracking.",
  openGraph: {
    title: "Terms of Service | Mandy.gg",
    description: "Read the Mandy.gg Terms of Service for using our crypto casino rewards platform.",
    type: "website",
    url: "https://mandy.gg/terms",
  },
  alternates: {
    canonical: "https://mandy.gg/terms",
  },
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black font-sans">
      <div className="relative z-10">
        <nav className="mx-2 md:mx-4 mt-2 md:mt-4 mb-2">
          <Card
            className="px-3 py-2 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-white/30 shadow-lg backdrop-blur-sm"
            style={{
              backgroundColor: "#010101",
              boxShadow: "none",
            }}
          >
            <div className="flex justify-between items-center">
              <Link href="/">
                <Image
                  src="/images/mandy-logo-menu-icon-white.svg"
                  alt="Mandy.gg"
                  width={250}
                  height={80}
                  className="h-12 md:h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                  priority
                />
              </Link>
              <Link href="/">
                <Button className="bg-[#5cfec0] hover:bg-[#4de8ad] text-black font-bold rounded-xl uppercase">
                  Back to Home
                </Button>
              </Link>
            </div>
          </Card>
        </nav>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card
            className="p-6 md:p-8 rounded-xl border border-white/30"
            style={{
              backgroundColor: "#010101",
              border: "0.5px solid rgba(255,255,255,0.5)",
              boxShadow: "none",
            }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-[#5cfec0] mb-6 uppercase">Terms of Service</h1>
            <p className="text-white/55 mb-6">Last Updated: January 2025</p>

            <div className="space-y-6 text-white/80">
              <section>
                <h2 className="text-2xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using Mandy.gg ("the Service"), you accept and agree to be bound by these Terms of
                  Service. If you do not agree to these terms, please do not use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">2. Description of Service</h2>
                <p>
                  Mandy.gg is an informational platform that provides leaderboard tracking, statistics, and community
                  features for users of third-party cryptocurrency gambling platforms, primarily Thrill.gg. We are not a
                  gambling operator and do not facilitate gambling transactions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">3. Eligibility</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You must be at least 18 years of age to use this Service</li>
                  <li>You must comply with all applicable laws in your jurisdiction regarding online gambling</li>
                  <li>
                    You are responsible for ensuring that your use of third-party gambling platforms is legal in your
                    location
                  </li>
                  <li>We reserve the right to verify your age and identity at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">4. Account Registration</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the security of your account credentials</li>
                  <li>You may only create one account per person</li>
                  <li>
                    Once you link your Thrill account, this connection is permanent and cannot be changed without
                    contacting support
                  </li>
                  <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">5. Third-Party Services</h2>
                <p className="mb-2">
                  Mandy.gg integrates with third-party services including but not limited to Thrill.gg. By using our
                  Service:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You acknowledge that we are not responsible for the actions of third-party platforms</li>
                  <li>You agree to comply with the terms of service of any third-party platforms you use</li>
                  <li>We are not liable for any losses incurred through third-party gambling platforms</li>
                  <li>Referral codes and bonuses are subject to the terms of the third-party platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">6. Responsible Gambling</h2>
                <p className="mb-2">
                  Cryptocurrency gambling involves significant risk. By using our Service, you acknowledge that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Gambling can be addictive and you should only gamble what you can afford to lose</li>
                  <li>We encourage responsible gambling practices</li>
                  <li>We are not responsible for gambling losses incurred on third-party platforms</li>
                  <li>If you have a gambling problem, please seek help from appropriate resources</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">7. Prohibited Activities</h2>
                <p className="mb-2">You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the Service for any illegal purpose</li>
                  <li>Create multiple accounts or use fraudulent information</li>
                  <li>Attempt to manipulate leaderboards or statistics</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Reverse engineer, decompile, or attempt to extract source code from the Service</li>
                  <li>Use automated tools or bots to access the Service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">8. Intellectual Property</h2>
                <p>
                  All content, trademarks, and intellectual property on Mandy.gg are owned by or licensed to us. You may
                  not use, copy, or distribute any content without our express written permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">9. Disclaimer of Warranties</h2>
                <p>
                  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT THE SERVICE
                  WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. WE ARE NOT RESPONSIBLE FOR ANY LOSSES OR DAMAGES ARISING
                  FROM YOUR USE OF THE SERVICE.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">10. Limitation of Liability</h2>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, MANDY.GG SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                  SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">11. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms of Service at any time. Changes will be effective
                  immediately upon posting. Your continued use of the Service constitutes acceptance of the modified
                  terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">12. Contact Information</h2>
                <p>
                  For questions about these Terms of Service, please contact us via our{" "}
                  <Link
                    href="https://t.me/mandysupport_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5cfec0] hover:underline"
                  >
                    Telegram Support Bot
                  </Link>
                  .
                </p>
              </section>
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}

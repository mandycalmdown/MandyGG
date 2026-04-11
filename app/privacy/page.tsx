import type { Metadata } from "next"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Mandy.gg collects, uses, and protects your personal information. Our commitment to your privacy and data security.",
  openGraph: {
    title: "Privacy Policy | Mandy.gg",
    description: "Learn how Mandy.gg collects, uses, and protects your personal information.",
    type: "website",
    url: "https://mandy.gg/privacy",
  },
  alternates: {
    canonical: "https://mandy.gg/privacy",
  },
}

export default function PrivacyPolicy() {
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
            <h1 className="text-3xl md:text-4xl font-bold text-[#5cfec0] mb-6 uppercase">Privacy Policy</h1>
            <p className="text-white/55 mb-6">Last Updated: January 2025</p>

            <div className="space-y-6 text-white/80">
              <section>
                <h2 className="text-2xl font-bold text-white mb-3">1. Introduction</h2>
                <p>
                  Mandy.gg ("we," "our," or "us") respects your privacy and is committed to protecting your personal
                  data. This Privacy Policy explains how we collect, use, and safeguard your information when you use
                  our Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">2. Information We Collect</h2>
                <h3 className="text-xl font-semibold text-white mb-2 mt-4">2.1 Information You Provide</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Email address (for account creation and verification)</li>
                  <li>Display name (chosen by you)</li>
                  <li>Thrill username (to link your gambling account)</li>
                  <li>Profile photo (optional)</li>
                  <li>Mailing list subscription (if you opt in)</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-2 mt-4">2.2 Information We Collect Automatically</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Usage data and analytics</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mb-2 mt-4">2.3 Information from Third-Party Sources</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Publicly available leaderboard data from Thrill.gg API</li>
                  <li>Wagering statistics and XP data</li>
                  <li>Username and ranking information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">3. How We Use Your Information</h2>
                <p className="mb-2">We use your information to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide and maintain the Service</li>
                  <li>Display your statistics and leaderboard position</li>
                  <li>Verify your identity and link your Thrill account</li>
                  <li>Send you important updates and notifications</li>
                  <li>Improve and optimize the Service</li>
                  <li>Prevent fraud and abuse</li>
                  <li>Comply with legal obligations</li>
                  <li>Send marketing communications (if you opt in)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">4. How We Share Your Information</h2>
                <p className="mb-2">We may share your information with:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Service Providers:</strong> Supabase (database), Vercel (hosting), Upstash (caching), Vercel
                    Blob (file storage)
                  </li>
                  <li>
                    <strong>Public Display:</strong> Your display name, Thrill username, and statistics are publicly
                    visible on leaderboards
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or to protect our rights
                  </li>
                </ul>
                <p className="mt-2">
                  We do NOT sell your personal information to third parties for marketing purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">5. Data Security</h2>
                <p>
                  We implement industry-standard security measures to protect your data, including encryption, secure
                  authentication, and regular security audits. However, no method of transmission over the internet is
                  100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">6. Data Retention</h2>
                <p>
                  We retain your personal information for as long as your account is active or as needed to provide the
                  Service. You may request deletion of your account and data by contacting support, though some
                  information may be retained for legal or legitimate business purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">7. Your Rights</h2>
                <p className="mb-2">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Withdraw consent at any time</li>
                  <li>Opt out of marketing communications</li>
                </ul>
                <p className="mt-2">
                  To exercise these rights, please contact us via our{" "}
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

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">8. Cookies and Tracking</h2>
                <p>
                  We use cookies and similar technologies to enhance your experience, analyze usage, and remember your
                  preferences. You can control cookies through your browser settings, though some features may not
                  function properly if cookies are disabled.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">9. Third-Party Links</h2>
                <p>
                  Our Service contains links to third-party websites (such as Thrill.gg and Telegram). We are not
                  responsible for the privacy practices of these external sites. We encourage you to review their
                  privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">10. Children's Privacy</h2>
                <p>
                  Our Service is not intended for individuals under 18 years of age. We do not knowingly collect
                  personal information from children. If you believe we have collected information from a minor, please
                  contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">11. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your own. We ensure
                  appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">12. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by
                  posting the new policy on this page and updating the "Last Updated" date. Your continued use of the
                  Service after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-3">13. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy or our data practices, please contact us via our{" "}
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

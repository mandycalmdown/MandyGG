import { HowToJoinPage } from "@/components/how-to-join-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "How to Join Thrill with Code MANDY | MandyGG Rewards",
  description:
    "Step-by-step guide to join Thrill.com using referral code MANDY and unlock exclusive rewards, cash drops, and leaderboard prizes with MandyGG.",
  keywords:
    "Thrill casino, referral code MANDY, mandycalmdown, casino rewards, Thrill signup, MandyGG, sweepstakes casino",
  openGraph: {
    title: "How to Join Thrill with Code MANDY | MandyGG Rewards",
    description:
      "Join Thrill.com with code MANDY and get access to exclusive rewards, weekly cash drops, and leaderboard competitions.",
    type: "website",
    url: "https://mandy.gg/how-to-join",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Join Thrill with Code MANDY | MandyGG Rewards",
    description: "Step-by-step guide to join Thrill.com using referral code MANDY and unlock exclusive rewards.",
  },
}

export default function Page() {
  return <HowToJoinPage />
}

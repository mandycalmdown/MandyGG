import { HowToJoinPage } from "@/components/how-to-join-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "How to Join Thrill Casino with Code MANDY | Mandy.gg",
  description:
    "Step-by-step guide to joining Thrill crypto casino with referral code MANDY. Unlock exclusive bonuses, lossback rewards, and weekly wager race prizes.",
  keywords:
    "Thrill casino signup, referral code MANDY, mandycalmdown, casino rewards, Thrill registration, MandyGG, crypto casino bonus, how to join Thrill",
  openGraph: {
    title: "How to Join Thrill Casino with Code MANDY | Mandy.gg",
    description:
      "Join Thrill.com with code MANDY and get access to exclusive rewards, weekly cash drops, and leaderboard competitions.",
    type: "website",
    url: "https://www.mandy.gg/how-to-join",
    images: {
      url: "https://www.mandy.gg/images/mandy-gg-og-preview.jpg",
      width: 1200,
      height: 630,
      alt: "Mandy.gg - More Perks, Less Regret",
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Join Thrill Casino with Code MANDY | Mandy.gg",
    description: "Step-by-step guide to join Thrill.com using referral code MANDY and unlock exclusive rewards.",
    images: ["https://www.mandy.gg/images/mandy-gg-og-preview.jpg"],
  },
  alternates: {
    canonical: "https://www.mandy.gg/how-to-join",
  },
}

export default function Page() {
  return <HowToJoinPage />
}

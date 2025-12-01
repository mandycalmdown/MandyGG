import type { Metadata } from "next"
import { Leaderboard } from "@/components/leaderboard"

export const metadata: Metadata = {
  title: "Weekly $3500 Wager Race Leaderboard",
  description:
    "Compete in the weekly $3500 wager race on Thrill Casino with code MANDY. Track your position, view live rankings, and win crypto prizes every Thursday.",
  keywords: [
    "crypto wager race",
    "thrill casino leaderboard",
    "weekly crypto competition",
    "bitcoin gambling leaderboard",
    "code MANDY",
    "crypto casino prizes",
    "wager battle",
    "mandy.gg leaderboard",
  ],
  openGraph: {
    title: "Weekly $3500 Wager Race Leaderboard | Mandy.gg",
    description:
      "Compete in the weekly $3500 wager race on Thrill Casino with code MANDY. Track your position and win crypto prizes every Thursday.",
    type: "website",
    url: "https://mandy.gg/leaderboard",
    images: [
      {
        url: "/images/linkpreview.png",
        width: 1200,
        height: 630,
        alt: "Mandy.gg Weekly Wager Race Leaderboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Weekly $3500 Wager Race | Mandy.gg",
    description: "Compete for $3500 in weekly prizes with code MANDY on Thrill Casino.",
    images: ["/images/linkpreview.png"],
  },
  alternates: {
    canonical: "https://mandy.gg/leaderboard",
  },
}

export default function LeaderboardPage() {
  return <Leaderboard />
}

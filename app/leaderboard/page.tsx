import type { Metadata } from "next"
import { Leaderboard } from "@/components/leaderboard"

export const metadata: Metadata = {
  title: "Weekly $3500 Wager Race Leaderboard | Mandy.gg",
  description:
    "Live weekly $3500 crypto casino wager race leaderboard. Use code MANDY on Thrill to compete and win cash prizes every week.",
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
      "Live weekly $3500 crypto casino wager race leaderboard. Use code MANDY on Thrill to compete and win cash prizes every week.",
    type: "website",
    url: "https://www.mandy.gg/leaderboard",
    images: [
      {
        url: "https://www.mandy.gg/images/mandy-gg-og-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Mandy.gg - More Perks, Less Regret",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Weekly $3500 Wager Race | Mandy.gg",
    description: "Compete for $3500 in weekly prizes with code MANDY on Thrill Casino.",
    images: ["https://www.mandy.gg/images/mandy-gg-og-preview.jpg"],
  },
  alternates: {
    canonical: "https://www.mandy.gg/leaderboard",
  },
}

export default function LeaderboardPage() {
  return <Leaderboard />
}

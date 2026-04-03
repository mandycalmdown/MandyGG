import type { Metadata } from "next"
import { RewardsPage } from "@/components/rewards-page"

export const metadata: Metadata = {
  title: "Exclusive Crypto Casino Rewards & Bonuses | Mandy.gg",
  description:
    "Exclusive crypto casino bonuses and rewards for Mandy.gg community. Use code MANDY on Thrill for bonus codes, cash drops, and weekly wager race prizes.",
  keywords:
    "crypto casino rewards, thrill casino bonuses, code MANDY rewards, crypto gambling perks, VIP casino bonuses, lossback rewards, mandy.gg rewards",
  openGraph: {
    title: "Exclusive Crypto Casino Rewards & Bonuses | Mandy.gg",
    description: "Exclusive crypto casino bonuses and rewards for Mandy.gg community. Use code MANDY on Thrill.",
    type: "website",
    url: "https://www.mandy.gg/rewards",
    images: {
      url: "https://www.mandy.gg/images/mandy-gg-og-preview.jpg",
      width: 1200,
      height: 630,
      alt: "Mandy.gg - More Perks, Less Regret",
    },
  },
  twitter: {
    card: "summary_large_image",
    title: "Exclusive Rewards | Mandy.gg",
    description: "Unlock VIP perks and bonuses with code MANDY on Thrill Casino.",
    image: "https://www.mandy.gg/images/mandy-gg-og-preview.jpg",
  },
  alternates: {
    canonical: "https://www.mandy.gg/rewards",
  },
}

export default function Rewards() {
  return <RewardsPage />
}

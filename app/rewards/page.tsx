import type { Metadata } from "next"
import { RewardsPage } from "@/components/rewards-page"

export const metadata: Metadata = {
  title: "Exclusive Rewards & Bonuses",
  description:
    "Unlock exclusive rewards, bonuses, and VIP perks as a Mandy.gg community member. Use code MANDY on Thrill Casino for lossback, cashback, and special promotions.",
  keywords: [
    "crypto casino rewards",
    "thrill casino bonuses",
    "code MANDY rewards",
    "crypto gambling perks",
    "VIP casino bonuses",
    "lossback rewards",
    "mandy.gg rewards",
  ],
  openGraph: {
    title: "Exclusive Rewards & Bonuses | Mandy.gg",
    description: "Unlock exclusive rewards, bonuses, and VIP perks as a Mandy.gg community member with code MANDY.",
    type: "website",
    url: "https://mandy.gg/rewards",
    images: [
      {
        url: "/images/linkpreview.png",
        width: 1200,
        height: 630,
        alt: "Mandy.gg Exclusive Rewards",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Exclusive Rewards | Mandy.gg",
    description: "Unlock VIP perks and bonuses with code MANDY on Thrill Casino.",
    images: ["/images/linkpreview.png"],
  },
  alternates: {
    canonical: "https://mandy.gg/rewards",
  },
}

export default function Rewards() {
  return <RewardsPage />
}

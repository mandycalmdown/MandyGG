import { Homepage } from "@/components/homepage"
import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: "Mandy.gg - More perks, less regret | Weekly $3500 Wager Race",
  description:
    "Bad decisions, great rewards! Mandy.gg gives you cashback and exclusive bonuses at the best online crypto casinos . If you're going to Plinko your crypto away, get the most out of it!",
  keywords:
    "crypto casino, bitcoin gambling, weekly wager battle, thrill casino, code MANDY, crypto bonuses, lossback, VIP perks, cryptocurrency betting, mandy.gg, bitcoin casino, crypto gaming, blockchain casino, cryptocurrency betting, crypto slots, bitcoin slots, live casino battles, crypto leaderboard, exclusive casino bonuses, crypto rewards, gambling influencer, casino streamer",
  creator: "Mandy.gg",
  publisher: "Mandy.gg",
  robots: "index, follow",
  openGraph: {
    title: "Mandy.gg - More perks, less regret | Weekly $3500 Wager Race",
    description: "More perks, less regret | Weekly $3500 Wager Race",
    url: "https://mandy.gg",
    siteName: "Mandy.gg",
    type: "website",
    images: {
      url: "/images/linkpreview.png",
      width: 1200,
      height: 630,
      alt: "Mandy.gg - Crypto rewards for degens",
    },
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mandy.gg - Crypto rewards for degens",
    description: "Weekly $3500 wager battles and exclusive crypto casino bonuses with code MANDY.",
    image: "/images/linkpreview.png",
    creator: "@mandygg",
  },
  alternates: {
    canonical: "https://mandy.gg",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  other: {
    "theme-color": "#5cfec0",
    "msapplication-TileColor": "#000000",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Mandy.gg",
    "mobile-web-app-capable": "yes",
    "format-detection": "telephone=no",
  },
}

export default function Home() {
  return <Homepage />
}

import { Homepage } from "@/components/homepage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Mandy.gg - Premier Crypto Casino & Gaming Platform | Weekly $3500 Wager Battles",
  description:
    "Join Mandy.gg for exclusive crypto casino bonuses, weekly $3500 wager battles, and VIP perks with Thrill Casino. Use code MANDY for instant lossback access and community rewards.",
  keywords:
    "crypto casino, bitcoin gambling, weekly wager battle, thrill casino, code MANDY, crypto bonuses, lossback, VIP perks, cryptocurrency betting, mandy.gg, bitcoin casino, crypto gaming, blockchain casino, cryptocurrency betting, crypto slots, bitcoin slots, live casino battles, crypto leaderboard, exclusive casino bonuses, crypto rewards, gambling influencer, casino streamer",
  authors: [{ name: "Mandy.gg" }],
  creator: "Mandy.gg",
  publisher: "Mandy.gg",
  robots: "index, follow",
  openGraph: {
    title: "Mandy.gg - Premier Crypto Casino & Gaming Platform",
    description: "Weekly $3500 wager battles, exclusive bonuses, and VIP perks with code MANDY at Thrill Casino.",
    url: "https://mandy.gg",
    siteName: "Mandy.gg",
    type: "website",
    images: [
      {
        url: "/images/linkpreview.png",
        width: 1200,
        height: 630,
        alt: "Mandy.gg - Premier Crypto Casino Platform",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mandy.gg - Premier Crypto Casino Platform",
    description: "Weekly $3500 wager battles and exclusive crypto casino bonuses with code MANDY.",
    images: ["/images/linkpreview.png"],
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

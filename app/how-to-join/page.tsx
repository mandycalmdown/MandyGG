import { HowToJoinPage } from "@/components/how-to-join-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "How to Join Thrill with Code MANDY",
  description:
    "Step-by-step guide to join Thrill.com using referral code MANDY and unlock exclusive rewards, cash drops, and leaderboard prizes with MandyGG.",
  keywords: [
    "Thrill casino signup",
    "referral code MANDY",
    "mandycalmdown",
    "casino rewards",
    "Thrill registration",
    "MandyGG",
    "crypto casino bonus",
    "how to join Thrill",
  ],
  openGraph: {
    title: "How to Join Thrill with Code MANDY | Mandy.gg",
    description:
      "Join Thrill.com with code MANDY and get access to exclusive rewards, weekly cash drops, and leaderboard competitions.",
    type: "website",
    url: "https://mandy.gg/how-to-join",
    images: [
      {
        url: "/images/linkpreview.png",
        width: 1200,
        height: 630,
        alt: "How to Join Thrill with Code MANDY",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Join Thrill with Code MANDY",
    description: "Step-by-step guide to join Thrill.com using referral code MANDY and unlock exclusive rewards.",
    images: ["/images/linkpreview.png"],
  },
  alternates: {
    canonical: "https://mandy.gg/how-to-join",
  },
}

export default function Page() {
  return <HowToJoinPage />
}

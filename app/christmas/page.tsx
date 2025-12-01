import type { Metadata } from "next"
import { ChristmasAdventCalendar } from "@/components/christmas-advent-calendar"

export const metadata: Metadata = {
  title: "Mandy's Christmas Advent Calendar | Daily Rewards & Surprises",
  description:
    "Open a new door every day in December for exclusive rewards, bonuses, and surprises. Mandy's Christmas Advent Calendar brings daily gifts to code MANDY users.",
  keywords: [
    "christmas advent calendar",
    "daily rewards",
    "crypto casino christmas",
    "holiday bonuses",
    "mandy.gg christmas",
    "thrill casino christmas",
    "advent calendar rewards",
  ],
  openGraph: {
    title: "Mandy's Christmas Advent Calendar | Daily Rewards & Surprises",
    description: "Open a new door every day in December for exclusive rewards, bonuses, and surprises with code MANDY.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mandy's Christmas Advent Calendar",
    description: "Daily rewards and surprises throughout December with code MANDY.",
  },
}

export default function ChristmasPage() {
  return <ChristmasAdventCalendar />
}

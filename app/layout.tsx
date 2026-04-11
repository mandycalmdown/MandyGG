import type React from "react"
import type { Viewport } from "next"
import { JetBrains_Mono, Poppins } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
  weight: ["300", "400", "500", "600", "700"],
})

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
}

export const metadata = {
  title: {
    template: "%s | Mandy.gg",
    default: "Mandy.gg | Best Crypto Casino Bonuses & Weekly $3500 Wager Race | Code MANDY",
  },
  description:
    "Use code MANDY on Thrill Casino for exclusive crypto casino bonuses, rewards, and a $3500 weekly wager race leaderboard. The best Stake alternative.",
  keywords:
    "crypto casino bonus, Thrill casino code, best crypto casino, Stake alternative, casino lossback, wager race, MANDY code, crypto gambling bonus 2026",
  creator: "Mandy.gg",
  publisher: "Mandy.gg",
  robots: "index, follow",
  openGraph: {
    title: "Mandy.gg | Crypto Casino Bonuses with Code MANDY",
    description: "Exclusive crypto casino perks, $3500 weekly wager race, and lossback rewards. Use code MANDY on Thrill.",
    url: "https://www.mandy.gg",
    siteName: "Mandy.gg",
    type: "website",
    images: {
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandygg_sitepreview-B8vVqJHUkR7Bysk6KRJEKJPsfDV5Ri.png",
      width: 1200,
      height: 630,
      alt: "Mandy.gg — Yeah I'm a Girl and I Gamble",
    },
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mandy.gg | Crypto Casino Bonuses with Code MANDY",
    description: "Exclusive crypto casino perks, $3500 weekly wager race, get more rewards. Use code MANDY on Thrill.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandygg_sitepreview-B8vVqJHUkR7Bysk6KRJEKJPsfDV5Ri.png",
    creator: "@mandygg",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  other: {
    "theme-color": "#000000",
  },
  generator: 'v0.app'
}

function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Mandy.gg",
    url: "https://www.mandy.gg",
    description: "Exclusive crypto casino bonuses and weekly $3500 wager race with code MANDY on Thrill Casino",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.mandy.gg/?s={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${poppins.variable} antialiased bg-black shadow-none`}>
      <body>
        <StructuredData />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

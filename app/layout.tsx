import type React from "react"
import { Roboto_Condensed, Poppins } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-condensed",
  weight: ["300", "400", "700"],
})

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata = {
  title: {
    template: "%s | Mandy.gg",
    default: "Mandy.gg - More perks, less regret | Weekly $3500 Wager Race",
  },
  description:
    "Bad decisions, great rewards! Mandy.gg gives you cashback and exclusive bonuses every time you punt with code MANDY. If you’re going to Plinko your crypto away, get the most out of it!",
  keywords:
    "crypto casino, bitcoin gambling, weekly wager battle, thrill casino, code MANDY, crypto bonuses, lossback, VIP perks, cryptocurrency betting, mandy.gg, bitcoin casino, crypto gaming, blockchain casino, cryptocurrency betting, crypto slots, bitcoin slots, live casino battles, crypto leaderboard, exclusive casino bonuses, crypto rewards, gambling influencer, casino streamer",
  authors: [{ name: "Mandy.gg" }],
  creator: "Mandy.gg",
  publisher: "Mandy.gg",
  robots: "index, follow",
  openGraph: {
    title: "Mandy.gg - More perks, less regret | Weekly $3500 Wager Race",
    description: "Bad decisions, great rewards! Mandy.gg gives you cashback and exclusive bonuses every time you punt with code MANDY. If you’re going to Plinko your crypto away, get the most out of it!",
    url: "https://mandy.gg",
    siteName: "Mandy.gg",
    type: "website",
    images: [
      {
        url: "/images/linkpreview.png",
        width: 1200,
        height: 630,
        alt: "Mandy.gg - Crypto rewards for degens",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mandy.gg - More perks, less regret | Weekly $3500 Wager Race",
    description: "Bad decisions, great rewards! Mandy.gg gives you cashback and exclusive bonuses every time you punt with code MANDY.",
    images: ["/images/linkpreview.png"],
    creator: "@mandygg",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    other: [
      { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png" },
    ],
  },
  manifest: "/site.webmanifest",
  other: {
    "theme-color": "#5cfec0",
  },
}

function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mandy.gg",
    url: "https://mandy.gg",
    logo: "https://mandy.gg/images/mandy-logo-menu-icon-white.svg",
    description:
      "Bad decisions, great rewards! Mandy.gg gives you cashback and exclusive bonuses every time you punt with code MANDY. If you’re going to Plinko your crypto away, get the most out of it!",
    sameAs: [
      "https://t.me/Mandythrill",
      "https://t.me/MandyggChat",
      "https://t.me/MandySupport_bot",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: "https://t.me/MandySupport_bot",
    },
    offers: [
      {
        "@type": "Offer",
        name: "Weekly $3500 Wager Race",
        description: "Compete in weekly $3500 wager battles for crypto prizes and get extra perks for using code MANDY.",
        category: "Gaming Competition",
      },
      {
        "@type": "Offer",
        name: "Exclusive Casino Bonuses & Lossback",
        description: "Exclusive crypto casino bonuses with code MANDY including lossback access and VIP perks. More perks, less regret!",
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "BTC",
        },
      },
    ],
    mainEntity: {
      "@type": "WebSite",
      "@id": "https://mandy.gg/#website",
      url: "https://mandy.gg",
      name: "Mandy.gg",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://mandy.gg/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
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
    <html lang="en" className={`${robotoCondensed.variable} ${poppins.variable} antialiased bg-black shadow-none`}>
      <body>
        <StructuredData />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

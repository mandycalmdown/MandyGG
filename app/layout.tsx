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
    default: "Mandy.gg - Premier Crypto Casino & Gaming Platform",
  },
  description: "Premier crypto casino and gaming platform partnered with Thrill Casino",
  keywords: "crypto casino, bitcoin casino, thrill casino, mandy.gg, crypto gambling",
  authors: [{ name: "Mandy.gg" }],
  creator: "Mandy.gg",
  publisher: "Mandy.gg",
  robots: "index, follow",
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
    generator: 'v0.app'
}

function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Mandy.gg",
    url: "https://mandy.gg",
    logo: "https://mandy.gg/images/mandy-logo-menu-icon-white.svg",
    description:
      "Premier crypto casino and gaming platform partnered with Thrill Casino offering exclusive bonuses, weekly wager battles, and VIP perks",
    sameAs: ["https://t.me/Mandythrill", "https://t.me/MandyggChat", "https://t.me/MandySupport_bot"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: "https://t.me/MandySupport_bot",
    },
    offers: [
      {
        "@type": "Offer",
        name: "Weekly Wager Battle",
        description: "Compete in weekly wager battles for crypto prizes",
        category: "Gaming Competition",
      },
      {
        "@type": "Offer",
        name: "Exclusive Casino Bonuses",
        description: "Exclusive crypto casino bonuses with code MANDY including lossback access and VIP perks",
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

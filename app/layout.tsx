import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter, Montserrat } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"

// Initialize the Inter font with the weights we need
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

// Initialize the Montserrat font with the weights we need
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["500", "600", "700"],
})

export const metadata: Metadata = {
  title: "MealMate - Food Donation Platform",
  description: "Connect food donors with NGOs to reduce food waste and help those in need",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'
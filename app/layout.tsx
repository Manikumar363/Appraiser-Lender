import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import { GlobalSearchProvider } from "@/components/search-context";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EMADI Lender Portal",
  description: "Lender portal for EMADI Appraisers",
  generator: 'v0.dev'
}

// Pre-render the default theme class & color-scheme so server & client match
const DEFAULT_THEME = "light";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={DEFAULT_THEME}              // matches ThemeProvider defaultTheme
      style={{ colorScheme: DEFAULT_THEME }} // prevent mismatch of color-scheme
      suppressHydrationWarning               // ignore minor diffs if theme switches early
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme={DEFAULT_THEME}
          enableSystem={false}
          disableTransitionOnChange
        >
          <GlobalSearchProvider>
            <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading...</div>}>
              {children}
            </Suspense>
          </GlobalSearchProvider>
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
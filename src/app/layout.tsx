import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VRC Tuesday',
  description: 'Team-based badminton tournament scoring app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VRC Tuesday',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-180.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon-167.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} app-bg min-h-screen text-slate-900`}>
        <a href="#main" className="skip-link">Skip to content</a>
        <header
          className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white sticky top-0 z-50 shadow-lg safe-area-inset-top"
          role="banner"
        >
          <div className="max-w-[428px] mx-auto flex items-center justify-between px-4 py-3">
            <span className="text-base font-bold tracking-tight">VRC Tuesday</span>
            <span
              className="text-[10px] font-semibold uppercase tracking-widest text-blue-100 bg-white/10 border border-white/15 rounded-full px-2 py-0.5"
              aria-label="Sport: Badminton"
            >
              Badminton
            </span>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="min-h-screen flex flex-col focus:outline-none">
          {children}
        </main>
      </body>
    </html>
  )
}

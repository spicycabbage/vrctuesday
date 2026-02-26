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
      <body className={`${inter.className} bg-indigo-50 min-h-screen`}>
        <header className="bg-indigo-700 text-white sticky top-0 z-50 shadow-lg safe-area-inset-top">
          <div className="max-w-[428px] mx-auto flex items-center justify-between px-4 py-3">
            <span className="text-base font-bold tracking-tight">VRC Tuesday</span>
            <span className="text-xs text-indigo-300 font-medium uppercase tracking-widest">Badminton</span>
          </div>
        </header>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}

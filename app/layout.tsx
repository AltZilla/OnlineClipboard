import type { Metadata, Viewport } from 'next'
import './globals.css'
import { DeviceProvider } from '@/lib/DeviceContext'
import ClientWrapper from '@/components/ClientWrapper'

export const metadata: Metadata = {
  title: 'Online Clipboard',
  description: 'Share text and files between devices with a unique ID',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Clipboard',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#1e3a5f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <DeviceProvider>
          {/* Background decorations */}
          <div className="sticky-note-1 notebook-decoration"></div>
          <div className="sticky-note-2 notebook-decoration"></div>
          <div className="sticky-note-3 notebook-decoration"></div>
          <div className="paper-clip paper-clip-1"></div>
          <div className="paper-clip paper-clip-2"></div>
          <div className="star-decoration star-1">⭐</div>
          <div className="star-decoration star-2">✨</div>
          <div className="star-decoration star-3">💫</div>

          <ClientWrapper>
            <main className="relative w-full px-4 sm:px-6 lg:px-8 py-8 pt-16 sm:pt-24 z-10">
              {children}
            </main>
          </ClientWrapper>
        </DeviceProvider>
      </body>
    </html>
  )
}



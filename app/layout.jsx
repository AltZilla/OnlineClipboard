import './globals.css'
import { ToastProvider } from '@/components/Toast'
import { Analytics } from '@vercel/analytics/next'

const siteUrl = 'https://broomboard.vercel.app'
const siteDescription =
  'Online clipboard to share text and files between devices, with optional email inbox delivery.'

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Online Clipboard',
    template: '%s | Online Clipboard',
  },
  description: siteDescription,
  applicationName: 'Online Clipboard',
  keywords: [
    'private online clipboard with file upload',
    'share notes and files between phone and laptop',
    'send clipboard text to email inbox',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Online Clipboard',
    title: 'Online Clipboard',
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Clipboard',
    description: siteDescription,
  },
  verification: {
    google: 'uaULjIzsKp4Mz8U0n6P3SCXRgDXj-8FWJmNUpSYuE3s',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <div className="sticky-note-1 notebook-decoration"></div>
          <div className="sticky-note-2 notebook-decoration"></div>
          <div className="sticky-note-3 notebook-decoration"></div>
          <div className="paper-clip paper-clip-1"></div>
          <div className="paper-clip paper-clip-2"></div>
          <div className="star-decoration star-1">⭐</div>
          <div className="star-decoration star-2">✨</div>
          <div className="star-decoration star-3">💫</div>
          <main className="main-container relative py-4 z-10 pt-responsive">{children}</main>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Online Clipboard',
  description: 'Share text and files between devices with a unique ID',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Background decorations */}
        <div className="sticky-note-1 notebook-decoration"></div>
        <div className="sticky-note-2 notebook-decoration"></div>
        <div className="sticky-note-3 notebook-decoration"></div>
        <div className="paper-clip paper-clip-1"></div>
        <div className="paper-clip paper-clip-2"></div>
        <div className="star-decoration star-1">⭐</div>
        <div className="star-decoration star-2">✨</div>
        <div className="star-decoration star-3">💫</div>

        <main className="main-container relative py-4 z-10 pt-responsive">
          {children}
        </main>
      </body>
    </html>
  )
}

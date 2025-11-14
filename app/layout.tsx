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
        <main className="relative w-full px-4 sm:px-6 lg:px-8 py-8 pt-16 sm:pt-24">
          {children}
        </main>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ParticlesBackground from '@/components/ParticlesBackground'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={`${inter.className} animated-gradient`}>
        <ParticlesBackground />
        <main className="relative w-full px-4 sm:px-6 lg:px-8 py-8 pt-16 sm:pt-24">
          {children}
        </main>
      </body>
    </html>
  )
}

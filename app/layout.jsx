import './globals.css'
import { ToastProvider } from '@/components/Toast'
import { Analytics } from '@vercel/analytics/next'

export const metadata = {
    metadataBase: new URL('https://broomboard.vercel.app'),
    title: 'Online Clipboard',
    description: 'Share text and files between devices with a unique ID',
    verification: {
        google: "uaULjIzsKp4Mz8U0n6P3SCXRgDXj-8FWJmNUpSYuE3s",
    },
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <ToastProvider>
                    { }
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
                </ToastProvider>
                <Analytics />
            </body>
        </html>
    )
}

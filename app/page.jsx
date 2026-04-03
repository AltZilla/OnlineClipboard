import HomePageClient from '@/components/HomePageClient'

export const metadata = {
  title: 'Online Clipboard for Sharing Text, Files, and Email Delivery',
  description:
    'Create private clipboards to share text and files across devices, and optionally send clipboard content directly to an email inbox.',
  alternates: {
    canonical: '/',
  },
  keywords: [
    'online clipboard with file upload and link',
    'share clipboard text across devices instantly',
    'email clipboard contents automatically',
    'temporary online clipboard for phone and pc',
  ],
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Online Clipboard',
  url: 'https://broomboard.vercel.app',
  description:
    'Online clipboard for sharing text/files between devices and optionally sending clipboard content to email inboxes.',
  inLanguage: 'en-US',
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient />
    </>
  )
}

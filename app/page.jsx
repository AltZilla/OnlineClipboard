import HomePageClient from '@/components/HomePageClient'
import { absoluteUrl, siteName } from '@/lib/seo'

export const metadata = {
  title: 'Online Clipboard - Share Text and Files Between Devices',
  description:
    'Use a temporary online clipboard to share text and files between devices with a 4-digit ID, 24-hour expiry, and optional email delivery.',
  alternates: {
    canonical: '/',
  },
  keywords: [
    'online clipboard with file upload and link',
    'share clipboard text across devices instantly',
    'email clipboard contents automatically',
    'temporary online clipboard for phone and pc',
  ],
  openGraph: {
    title: 'Online Clipboard - Share Text and Files Between Devices',
    description:
      'Create a temporary online clipboard for text, files, and email delivery.',
    url: absoluteUrl('/'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Clipboard - Share Text and Files Between Devices',
    description:
      'Create a temporary online clipboard for text, files, and email delivery.',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: siteName,
  url: absoluteUrl('/'),
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  description:
    'Temporary online clipboard for sharing text and files between devices with a 4-digit ID, 24-hour expiry, and optional email delivery.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
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

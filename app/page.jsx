import HomePageClient from '@/components/HomePageClient'
import { homepageFaqItems } from '@/lib/seo-content'
import { absoluteUrl, siteName } from '@/lib/seo'

const ogImage = {
  url: absoluteUrl('/og-online-clipboard.png'),
  width: 1200,
  height: 630,
  alt: 'Online Clipboard for sharing text and files between devices',
}

export const metadata = {
  title: 'Online Clipboard - Share Text and Files Between Devices',
  description:
    'Use Online Clipboard to share text and files between devices with a temporary 4-digit clipboard ID, 24-hour expiry, QR sharing, and optional email delivery.',
  alternates: {
    canonical: '/',
  },
  keywords: [
    'online clipboard',
    'Online Clipboard',
    'online clipboard with file upload and link',
    'clipboard file upload',
    'share clipboard text across devices instantly',
    'share text and files between devices',
    'temporary clipboard',
    '4-digit clipboard ID',
    'send clipboard to email',
    'email clipboard contents automatically',
    'temporary online clipboard for phone and pc',
  ],
  openGraph: {
    title: 'Online Clipboard - Share Text and Files Between Devices',
    description:
      'Create a temporary online clipboard for text, files, and email delivery.',
    url: absoluteUrl('/'),
    type: 'website',
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Clipboard - Share Text and Files Between Devices',
    description:
      'Create a temporary online clipboard for text, files, and email delivery.',
    images: [ogImage.url],
  },
}

const webApplicationJsonLd = {
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

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: homepageFaqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomePageClient />
    </>
  )
}

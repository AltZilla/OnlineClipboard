import { absoluteUrl } from '@/lib/seo'

const ogImage = {
  url: absoluteUrl('/og-online-clipboard.png'),
  width: 1200,
  height: 630,
  alt: 'Online Clipboard email delivery with Account ID',
}

export const metadata = {
  title: 'Send Clipboard Content to Email',
  description:
    'Create a verified 6-digit Account ID with OTP verification and send Online Clipboard text and eligible file attachments directly to your inbox.',
  alternates: {
    canonical: '/account',
  },
  keywords: [
    'send clipboard to email',
    'email clipboard content',
    'online clipboard email delivery',
    'clipboard account id',
  ],
  openGraph: {
    title: 'Send Clipboard Content to Email',
    description:
      'Create a verified 6-digit Account ID and receive Online Clipboard text and files in your inbox.',
    url: absoluteUrl('/account'),
    type: 'website',
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Send Clipboard Content to Email',
    description:
      'Create a verified 6-digit Account ID and receive Online Clipboard text and files in your inbox.',
    images: [ogImage.url],
  },
}

export default function AccountLayout({ children }) {
  return children
}

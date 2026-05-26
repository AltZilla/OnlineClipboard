import { absoluteUrl } from '@/lib/seo'

export const metadata = {
  title: 'Send Clipboard Content to Email',
  description:
    'Create a verified account ID and send online clipboard text and eligible file attachments directly to your inbox.',
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
      'Create a verified account ID and receive online clipboard text and files in your inbox.',
    url: absoluteUrl('/account'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Send Clipboard Content to Email',
    description:
      'Create a verified account ID and receive online clipboard text and files in your inbox.',
  },
}

export default function AccountLayout({ children }) {
  return children
}

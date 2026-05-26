import { absoluteUrl } from '@/lib/seo'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/clipboard/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}

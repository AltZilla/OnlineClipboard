export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/clipboard/'],
    },
    sitemap: 'https://broomboard.vercel.app/sitemap.xml',
  }
}

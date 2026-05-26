export const siteUrl = 'https://broomboard.vercel.app'
export const siteName = 'Online Clipboard'

export const defaultSiteDescription =
  'Online clipboard to share text and files between devices, with optional email inbox delivery.'

export function absoluteUrl(path = '/') {
  return new URL(path, siteUrl).toString()
}

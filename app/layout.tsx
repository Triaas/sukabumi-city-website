import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pemerintah Kota Sukabumi | Website Resmi',
  description: 'Portal resmi Pemerintah Kota Sukabumi — Reugreug Pageuh Repeh Rapih.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="bg-white">
      <body className="antialiased">
        {/* Navbar dan Footer DIHAPUS dari sini */}
        
        {children}
        
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
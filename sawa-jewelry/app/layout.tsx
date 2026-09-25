import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, IBM_Plex_Mono, Inter } from 'next/font/google'
import './globals.css'
import { CustomCursor } from '@/components/CustomCursor'
import { LoadingScreen } from '@/components/LoadingScreen'
import { SawaAssistant } from '@/components/SawaAssistant'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'SAWA-BIJOUTRIE',
  description: 'Discover exquisite handcrafted jewelry collections by SAWA. Premium luxury pieces with timeless elegance.',
  generator: 'SAWA-BIJOUTRIE.app',
  icons: {
    icon: [
      {
        url: '/sawa.jpeg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/sawa.jpeg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/sawa.jpeg',
        type: 'image/jpeg',
      },
    ],
    apple: '/sawa.jpeg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <body className={`${cormorant.variable} ${ibmPlexMono.variable} ${inter.variable} antialiased font-sans bg-background text-foreground cursor-none`}>
        <CustomCursor />
        <LoadingScreen />
        {children}
        <SawaAssistant />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

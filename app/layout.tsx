import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'TeamBoard',
    template: '%s | TeamBoard',
  },
  description: 'Collaborative project management and team productivity platform',
  keywords: ['project management', 'kanban', 'team collaboration', 'productivity'],
  authors: [{ name: 'WorkerMill' }],
  creator: 'WorkerMill',
  publisher: 'WorkerMill',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#6366f1',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
    ],
    shortcut: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TeamBoard',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'TeamBoard',
    title: 'TeamBoard - Collaborative Project Management',
    description: 'Streamline your team\'s workflow with our powerful Kanban board and project management tools.',
    url: 'https://teamboard.workermill.com',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TeamBoard - Collaborative Project Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TeamBoard - Collaborative Project Management',
    description: 'Streamline your team\'s workflow with our powerful Kanban board and project management tools.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#6366f1" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="application-name" content="TeamBoard" />
        <meta name="apple-mobile-web-app-title" content="TeamBoard" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
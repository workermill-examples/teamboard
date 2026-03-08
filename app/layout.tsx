import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TeamBoard',
  description: 'Collaborative project management and team productivity platform',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
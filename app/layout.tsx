import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Tae-Hoon Yong - AI Engineer',
  description: 'Personal tech blog of Tae-Hoon Yong',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  )
}


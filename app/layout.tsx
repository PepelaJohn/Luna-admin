import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Luna - Admin Panel',
  description: 'Welcome to Luna Admin Panel',
 
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

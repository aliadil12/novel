
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/client-providers'
import Layout from '@/components/layout/layout'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'عالم الروايات',
  description: 'اكتشف عالماً من الروايات المترجمة في متناول يديك',
  icons: {
    icon: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <Script
          src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          <Layout>{children}</Layout>
        </ClientProviders>
      </body>
    </html>
  )
}

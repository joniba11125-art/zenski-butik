import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Butique - Premium Moda',
    template: '%s | Butique'
  },
  description: 'Otkrijte našu premium kolekciju ženske mode.',
  openGraph: {
    type: 'website',
    locale: 'bs_BA',
    siteName: 'Butique',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bs">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
import type { Metadata, Viewport } from 'next'
import './globals.css'
import './updates.css'
import { PwaProvider } from '@/components/pwa-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/components/language-provider'
import { requestLanguage } from '@/lib/i18n-server'

export const metadata: Metadata = {
  title: 'Órbita',
  applicationName: 'Órbita',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Órbita' },
  formatDetection: { telephone: false },
  description: 'Serviços para membros Órbita',
  icons: {
    icon: [
      { url: '/icons/icon.svg?v=planet-1', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: '/icons/icon-192.png?v=planet-1',
  },
}

export const viewport: Viewport = {
  themeColor: '#20211f',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const language = await requestLanguage()
  return (
    <html lang={language} suppressHydrationWarning>
      <head>
        {/* The tiny local bootstrap must run before paint to avoid a theme flash. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/theme.js" />
      </head>
      <body>
        <LanguageProvider language={language}>
          <ThemeProvider>
            <PwaProvider>{children}</PwaProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}

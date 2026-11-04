import type { Metadata, Viewport } from 'next'
import './globals.css'
import { PwaProvider } from '@/components/pwa-provider'
import { ThemeProvider } from '@/components/theme-provider'

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
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* The tiny local bootstrap must run before paint to avoid a theme flash. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/theme.js" />
      </head>
      <body>
        <ThemeProvider>
          <PwaProvider>{children}</PwaProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

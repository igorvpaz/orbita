import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Órbita — Serviços para membros',
    short_name: 'Órbita',
    description: 'Serviços extras para sua rotina no coworking',
    id: '/',
    scope: '/',
    start_url: '/member?source=pwa',
    lang: 'pt-BR',
    categories: ['business', 'productivity'],
    prefer_related_applications: false,
    display: 'standalone',
    background_color: '#20211f',
    theme_color: '#20211f',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}

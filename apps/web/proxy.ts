import type { NextRequest } from 'next/server'
import { refreshSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return refreshSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api/health|favicon.ico|icons|branding|sw.js|offline.html|manifest.webmanifest).*)',
  ],
}

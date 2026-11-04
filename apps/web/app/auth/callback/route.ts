import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  if (!code)
    return NextResponse.redirect(
      new URL('/login?error=invalid-link', url.origin),
    )
  const db = await createServerSupabase()
  const { error } = await db.auth.exchangeCodeForSession(code)
  if (error)
    return NextResponse.redirect(
      new URL('/login?error=expired-link', url.origin),
    )
  return NextResponse.redirect(new URL('/reset-password', url.origin))
}

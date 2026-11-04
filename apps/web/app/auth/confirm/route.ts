import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type')
  if (!token || !['invite', 'magiclink', 'recovery'].includes(type ?? '')) {
    return NextResponse.redirect(
      new URL('/login?error=invalid-link', url.origin),
    )
  }
  const db = await createServerSupabase()
  const { error } = await db.auth.verifyOtp({
    token_hash: token,
    type: type as EmailOtpType,
  })
  if (error)
    return NextResponse.redirect(
      new URL('/login?error=expired-link', url.origin),
    )
  return NextResponse.redirect(
    new URL(
      type === 'recovery' ? '/reset-password' : '/accept-invite',
      url.origin,
    ),
  )
}

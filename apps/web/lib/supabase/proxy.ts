import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function refreshSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const protectedPage =
    ['/admin', '/member'].some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) || ['/reset-password', '/accept-invite'].includes(pathname)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    if (protectedPage || pathname.startsWith('/api/'))
      return NextResponse.json(
        { error: 'Autenticação não configurada' },
        { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
      )
    return NextResponse.next({ request })
  }
  let response = NextResponse.next({ request })
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(toSet, headers) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        toSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
        for (const [name, value] of Object.entries(headers ?? {}))
          response.headers.set(name, value)
      },
    },
  })
  // Validate with Auth so revoked sessions cannot open protected pages.
  const { data, error } = await supabase.auth.getUser()
  if (protectedPage && (error || !data.user)) {
    const target = request.nextUrl.clone()
    target.pathname = '/login'
    target.search = ''
    if (
      pathname === '/admin' ||
      pathname.startsWith('/admin/') ||
      pathname === '/member' ||
      pathname.startsWith('/member/')
    )
      target.searchParams.set('next', pathname + request.nextUrl.search)
    const redirect = NextResponse.redirect(target)
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
    response.headers.forEach((value, name) => {
      if (['cache-control', 'expires', 'pragma'].includes(name))
        redirect.headers.set(name, value)
    })
    redirect.headers.set('Cache-Control', 'private, no-store')
    return redirect
  }
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

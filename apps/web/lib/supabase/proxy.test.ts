import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { refreshSession } from './proxy'

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  cookies: undefined as
    | undefined
    | {
        setAll: (
          values: { name: string; value: string; options?: object }[],
          headers?: Record<string, string>,
        ) => void
      },
}))

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((_url, _key, options) => {
    mocks.cookies = options.cookies
    return { auth: { getUser: mocks.getUser } }
  }),
}))

describe('protected route sessions', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test')
    mocks.getUser.mockReset()
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null })
  })
  afterEach(() => vi.unstubAllEnvs())

  it.each([
    '/admin',
    '/admin/members',
    '/member/orders',
    '/reset-password',
    '/accept-invite',
  ])('redirects anonymous requests for %s', async (path) => {
    const response = await refreshSession(
      new NextRequest(`http://localhost:3000${path}`),
    )
    expect(response.status).toBe(307)
    expect(new URL(response.headers.get('location')!).pathname).toBe('/login')
    expect(response.headers.get('cache-control')).toContain('no-store')
  })

  it('preserves the requested member URL', async () => {
    const response = await refreshSession(
      new NextRequest('http://localhost:3000/member/orders?status=requested'),
    )
    expect(
      new URL(response.headers.get('location')!).searchParams.get('next'),
    ).toBe('/member/orders?status=requested')
  })

  it('keeps cookie updates and cache headers when rejecting a session', async () => {
    mocks.getUser.mockImplementation(async () => {
      mocks.cookies!.setAll(
        [{ name: 'sb-session', value: '', options: { maxAge: 0 } }],
        { Pragma: 'no-cache' },
      )
      return { data: { user: null }, error: new Error('revoked') }
    })
    const response = await refreshSession(
      new NextRequest('http://localhost:3000/admin'),
    )
    expect(response.cookies.get('sb-session')?.value).toBe('')
    expect(response.headers.get('pragma')).toBe('no-cache')
  })

  it('allows a verified session to reach the server role checks', async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'verified-user' } },
      error: null,
    })
    const response = await refreshSession(
      new NextRequest('http://localhost:3000/admin'),
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  it('leaves API authorization to the endpoint', async () => {
    const response = await refreshSession(
      new NextRequest('http://localhost:3000/api/me'),
    )
    expect(response.headers.get('location')).toBeNull()
  })

  it('fails closed if authentication is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    const response = await refreshSession(
      new NextRequest('http://localhost:3000/admin'),
    )
    expect(response.status).toBe(503)
  })
})

import { describe, expect, it } from 'vitest'
import { destinationForRole } from './auth-navigation'

describe('post-login destination', () => {
  it('preserves a deep link inside the signed-in role area', () => {
    expect(
      destinationForRole('member', '/member/orders?status=requested'),
    ).toBe('/member/orders?status=requested')
  })

  it.each([
    'https://evil.example/admin',
    '//evil.example/admin',
    '/\\evil.example/admin',
    '/member/../../admin',
    '/membership',
    '/admin',
    '/login',
  ])('rejects an external or unauthorized member destination: %s', (next) => {
    expect(destinationForRole('member', next)).toBe('/member')
  })

  it('uses the correct default for each role', () => {
    expect(destinationForRole('admin')).toBe('/admin')
    expect(destinationForRole('member')).toBe('/member')
    expect(destinationForRole('admin', '/member/orders')).toBe('/admin')
  })
})

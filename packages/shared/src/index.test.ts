import { describe, expect, it } from 'vitest'
import { hasValidMembership } from './index'

describe('hasValidMembership', () => {
  const now = new Date('2026-11-01T12:00:00Z')
  it('allows an active member within the validity interval', () => {
    expect(
      hasValidMembership(
        'member',
        { status: 'active', startsAt: new Date('2026-10-01'), expiresAt: null },
        now,
      ),
    ).toBe(true)
  })
  it('blocks an expired membership immediately', () => {
    expect(
      hasValidMembership(
        'member',
        { status: 'active', startsAt: new Date('2026-10-01'), expiresAt: now },
        now,
      ),
    ).toBe(false)
  })
  it('does not treat an admin as a member', () => {
    expect(
      hasValidMembership(
        'admin',
        { status: 'active', startsAt: new Date('2026-10-01'), expiresAt: null },
        now,
      ),
    ).toBe(false)
  })
})

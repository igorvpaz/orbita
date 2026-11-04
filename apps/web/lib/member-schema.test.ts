import { describe, expect, it } from 'vitest'
import {
  createMemberSchema,
  memberPasswordSchema,
  memberSubscriptionSchema,
} from './member-schema'

const input = {
  email: ' Member@Example.com ',
  fullName: 'Demo Member',
  password: 'Training123',
  unitId: '10000000-0000-4000-8000-000000000001',
  planId: '20000000-0000-4000-8000-000000000001',
  initialStatus: 'active',
}

describe('admin-managed member input', () => {
  it('accepts subscription timestamps returned by PostgreSQL', () => {
    expect(
      memberSubscriptionSchema.safeParse({
        status: 'inactive',
        planId: input.planId,
        startsAt: '2026-11-03T04:00:00+00:00',
        expiresAt: null,
      }).success,
    ).toBe(true)
  })
  it('normalizes email without changing the chosen password', () => {
    const result = createMemberSchema.parse(input)
    expect(result.email).toBe('member@example.com')
    expect(result.password).toBe(input.password)
  })
  it('requires a password and rejects role injection', () => {
    expect(
      createMemberSchema.safeParse({ ...input, password: undefined }).success,
    ).toBe(false)
    expect(
      createMemberSchema.safeParse({ ...input, role: 'admin' }).success,
    ).toBe(false)
  })
  it('validates password limits on create and reset', () => {
    expect(
      createMemberSchema.safeParse({ ...input, password: 'short' }).success,
    ).toBe(false)
    expect(
      memberPasswordSchema.safeParse({ password: 'x'.repeat(129) }).success,
    ).toBe(false)
    expect(
      memberPasswordSchema.safeParse({ password: 'Training123' }).success,
    ).toBe(true)
  })
})

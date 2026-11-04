import { describe, it, expect } from 'vitest'
import { createAdminSchema, updateAdminSchema } from './admin-schema'
import { createServiceSchema, updateServiceSchema } from './service-schema'
describe('administration input boundaries', () => {
  const input = {
    fullName: 'Test Admin',
    email: 'admin@example.invalid',
    password: 'ExampleOnly123!',
  }
  it('rejects caller-supplied role or ID and weak passwords', () => {
    for (const extra of [
      { role: 'admin' },
      { id: crypto.randomUUID() },
      { password: 'short' },
    ])
      expect(createAdminSchema.safeParse({ ...input, ...extra }).success).toBe(
        false,
      )
  })
  it('permits details-only editing without resetting the password', () => {
    expect(
      updateAdminSchema.parse({ fullName: input.fullName, email: input.email }),
    ).toEqual({ fullName: input.fullName, email: input.email })
  })
  it('bounds capacity and slot length and preserves partial updates', () => {
    expect(updateServiceSchema.parse({ status: 'published' })).toEqual({
      status: 'published',
    })
    for (const capacityPerSlot of [1, 10, 20, 30, 50])
      expect(
        createServiceSchema.shape.capacityPerSlot.parse(capacityPerSlot),
      ).toBe(capacityPerSlot)
    for (const capacityPerSlot of [0, 501, 1.5])
      expect(
        createServiceSchema.shape.capacityPerSlot.safeParse(capacityPerSlot)
          .success,
      ).toBe(false)
    expect(
      createServiceSchema.shape.slotDurationMinutes.safeParse(61).success,
    ).toBe(false)
  })
})

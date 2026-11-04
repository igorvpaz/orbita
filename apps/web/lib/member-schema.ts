import { z } from 'zod'

export const memberDetailsSchema = z
  .object({
    email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
    fullName: z.string().trim().min(2).max(120),
    unitId: z.uuid(),
  })
  .strict()

export const memberPasswordSchema = z
  .object({
    password: z.string().min(8).max(128),
  })
  .strict()

export const createMemberSchema = memberDetailsSchema.extend({
  password: memberPasswordSchema.shape.password,
  planId: z.uuid(),
  initialStatus: z.enum(['active', 'inactive']),
  expiresAt: z.iso.datetime().nullable().optional(),
})

export const memberSubscriptionSchema = z.object({
  status: z.enum(['active', 'inactive']),
  planId: z.uuid(),
  startsAt: z.iso.datetime({ offset: true }),
  expiresAt: z.iso.datetime({ offset: true }).nullable(),
})

import { z } from 'zod'

export const ruleSchema = z.object({
  planId: z.uuid().nullable(),
  weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  priority: z.number().int().min(-100).max(100),
})

export const createServiceSchema = z.object({
  capacityPerSlot: z.number().int().min(1).max(500).default(10),
  slotDurationMinutes: z
    .number()
    .int()
    .min(15)
    .max(240)
    .multipleOf(15)
    .default(60),
  accessPlan: z.enum(['basic', 'premium']).default('basic'),
  unitId: z.uuid(),
  partnerId: z.uuid(),
  name: z.string().trim().min(2).max(120),
  descriptionPt: z.string().trim().min(10).max(4000),
  descriptionEn: z.string().trim().max(4000).nullable().default(null),
  category: z.string().trim().min(2).max(80),
  priceCents: z.number().int().min(0).max(10_000_000),
  status: z.enum(['draft', 'published']).default('draft'),
  rules: z.array(ruleSchema).max(20).default([]),
})

export const updateServiceSchema = createServiceSchema.partial().extend({
  capacityPerSlot: z.number().int().min(1).max(500).optional(),
  slotDurationMinutes: z
    .number()
    .int()
    .min(15)
    .max(240)
    .multipleOf(15)
    .optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  accessPlan: z.enum(['basic', 'premium']).optional(),
  rules: z.array(ruleSchema).max(20).optional(),
  descriptionEn: z.string().trim().max(4000).nullable().optional(),
})

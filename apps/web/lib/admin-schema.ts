import { z } from 'zod'
const fields = {
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  fullName: z.string().trim().min(2).max(120),
}
export const createAdminSchema = z
  .object({ ...fields, password: z.string().min(8).max(128) })
  .strict()
export const updateAdminSchema = z
  .object({ ...fields, password: z.string().min(8).max(128).optional() })
  .strict()

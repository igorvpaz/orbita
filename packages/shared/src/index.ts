import { z } from 'zod'

export const localeSchema = z.enum(['pt-BR', 'en'])
export const roleSchema = z.enum(['admin', 'member'])
export const membershipStatusSchema = z.enum(['active', 'inactive'])
export const serviceStatusSchema = z.enum(['draft', 'published', 'archived'])

export type Locale = z.infer<typeof localeSchema>
export type Role = z.infer<typeof roleSchema>
export type MembershipStatus = z.infer<typeof membershipStatusSchema>
export type ServiceStatus = z.infer<typeof serviceStatusSchema>

export function hasValidMembership(
  role: Role,
  membership: {
    status: MembershipStatus
    startsAt: Date
    expiresAt: Date | null
  } | null,
  now: Date,
): boolean {
  return (
    role === 'member' &&
    membership !== null &&
    membership.status === 'active' &&
    membership.startsAt <= now &&
    (membership.expiresAt === null || membership.expiresAt > now)
  )
}

import { apiFailure, dbResult, privateJson } from '@/lib/api'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const { db, profile, authUser } = await getCurrentUser()
    const membership =
      profile.role === 'member'
        ? dbResult(
            await db
              .from('memberships')
              .select('plan_id,status,starts_at,expires_at')
              .eq('user_id', authUser.id)
              .maybeSingle(),
          )
        : null
    return privateJson({ profile, membership })
  } catch (error) {
    return apiFailure(error)
  }
}

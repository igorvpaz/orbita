import { apiFailure, assertSameOrigin, dbResult, privateJson } from '@/lib/api'
import { requireActiveMember } from '@/lib/auth'

export async function GET() {
  try {
    const { db, authUser, membership } = await requireActiveMember()
    const plan = dbResult(
      await db
        .from('plans')
        .select('code,name')
        .eq('id', membership.plan_id)
        .single(),
    )
    return privateJson({
      plan,
      requests: dbResult(
        await db
          .from('upgrade_requests')
          .select('id,status,created_at,reviewed_at')
          .eq('member_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ),
    })
  } catch (error) {
    return apiFailure(error)
  }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const { db } = await requireActiveMember()
    const id = dbResult(await db.rpc('request_premium_upgrade'))
    return privateJson({ id }, 201)
  } catch (error) {
    return apiFailure(error)
  }
}

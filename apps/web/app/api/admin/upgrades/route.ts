import { apiFailure, dbResult, privateJson } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'
export async function GET() {
  try {
    const { db } = await requireAdmin()
    const requests = dbResult(
      await db
        .from('upgrade_requests')
        .select('id,member_id,status,created_at,reviewed_at')
        .order('created_at', { ascending: false })
        .limit(200),
    )
    const ids = [...new Set(requests.map((r) => r.member_id))]
    const profiles = ids.length
      ? dbResult(
          await db.from('profiles').select('id,full_name,email').in('id', ids),
        )
      : []
    return privateJson({
      requests: requests.map((r) => ({
        ...r,
        member: profiles.find((p) => p.id === r.member_id),
      })),
    })
  } catch (error) {
    return apiFailure(error)
  }
}

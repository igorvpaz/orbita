import { z } from 'zod'
import {
  apiFailure,
  assertSameOrigin,
  dbResult,
  parseBody,
  privateJson,
} from '@/lib/api'
import { requireAdmin } from '@/lib/auth'
const schema = z.object({ decision: z.enum(['approved', 'rejected']) }).strict()
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request)
    const { db } = await requireAdmin()
    const id = z.uuid().parse((await params).id)
    const { decision } = await parseBody(request, schema)
    return privateJson({
      status: dbResult(
        await db.rpc('review_premium_upgrade', { request_id: id, decision }),
      ),
    })
  } catch (error) {
    return apiFailure(error)
  }
}

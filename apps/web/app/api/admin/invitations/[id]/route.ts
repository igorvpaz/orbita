import {
  assertSameOrigin,
  apiFailure,
  ApiError,
  dbResult,
  privateJson,
} from '@/lib/api'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request)
    const { db } = await requireAdmin()
    const { id } = await params
    const existing = dbResult(
      await db
        .from('invitations')
        .select('id,status')
        .eq('id', id)
        .maybeSingle(),
    )
    if (!existing) throw new ApiError(404, 'Convite não encontrado')
    if (!['pending', 'delivery_failed'].includes(existing.status))
      throw new ApiError(409, 'Convite já resolvido')
    const revoked = dbResult(
      await db
        .from('invitations')
        .update({ status: 'revoked', updated_at: new Date().toISOString() })
        .eq('id', id)
        .in('status', ['pending', 'delivery_failed'])
        .select('id')
        .maybeSingle(),
    )
    if (!revoked) throw new ApiError(409, 'Convite já resolvido')
    return privateJson({ ok: true })
  } catch (error) {
    return apiFailure(error)
  }
}

import {
  assertSameOrigin,
  apiFailure,
  ApiError,
  dbResult,
  parseBody,
  privateJson,
} from '@/lib/api'
import { requireAdmin } from '@/lib/auth'
import { memberSubscriptionSchema } from '@/lib/member-schema'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request)
    const { db, authUser } = await requireAdmin()
    const { id } = await params
    const input = await parseBody(request, memberSubscriptionSchema)
    if (
      input.expiresAt &&
      new Date(input.expiresAt) <= new Date(input.startsAt)
    )
      throw new ApiError(422, 'Validade inválida')
    const [profile, plan] = await Promise.all([
      db
        .from('profiles')
        .select('id')
        .eq('id', id)
        .eq('role', 'member')
        .maybeSingle(),
      db
        .from('plans')
        .select('id')
        .eq('id', input.planId)
        .eq('active', true)
        .maybeSingle(),
    ])
    if (!dbResult(profile) || !dbResult(plan))
      throw new ApiError(404, 'Membro ou plano não encontrado')
    const updated = dbResult(
      await db
        .from('memberships')
        .update({
          status: input.status,
          plan_id: input.planId,
          starts_at: input.startsAt,
          expires_at: input.expiresAt,
          changed_by: authUser.id,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', id)
        .select('id,status')
        .single(),
    )
    return privateJson({ membership: updated })
  } catch (error) {
    return apiFailure(error)
  }
}

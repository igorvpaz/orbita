import {
  ApiError,
  apiFailure,
  assertSameOrigin,
  dbResult,
  parseBody,
  privateJson,
} from '@/lib/api'
import { requireAdmin } from '@/lib/auth'
import { memberDetailsSchema } from '@/lib/member-schema'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { z } from 'zod'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request)
    const { db } = await requireAdmin()
    const id = z.uuid().parse((await params).id)
    const input = await parseBody(request, memberDetailsSchema)
    const profile = dbResult(
      await db
        .from('profiles')
        .select('id,email')
        .eq('id', id)
        .eq('role', 'member')
        .maybeSingle(),
    )
    if (!profile) throw new ApiError(404, 'Membro não encontrado')
    const unit = dbResult(
      await db
        .from('units')
        .select('id')
        .eq('id', input.unitId)
        .eq('active', true)
        .maybeSingle(),
    )
    if (!unit) throw new ApiError(422, 'Unidade inválida')
    const admin = createAdminSupabase()
    const emailChanged = input.email !== profile.email
    if (emailChanged) {
      const { error } = await admin.auth.admin.updateUserById(id, {
        email: input.email,
        email_confirm: true,
      })
      if (error)
        throw new ApiError(
          422,
          'Não foi possível alterar o e-mail. Confira se já está em uso.',
        )
    }
    const result = await db
      .from('profiles')
      .update({
        email: input.email,
        full_name: input.fullName,
        unit_id: input.unitId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('role', 'member')
      .select('id')
      .single()
    if (result.error && emailChanged) {
      const rollback = await admin.auth.admin.updateUserById(id, {
        email: profile.email,
        email_confirm: true,
      })
      if (rollback.error)
        throw new ApiError(
          500,
          'Não foi possível sincronizar o e-mail. Revise o usuário no Supabase.',
        )
    }
    dbResult(result)
    return privateJson({ ok: true })
  } catch (error) {
    return apiFailure(error)
  }
}

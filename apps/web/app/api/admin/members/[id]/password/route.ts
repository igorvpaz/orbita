import {
  ApiError,
  apiFailure,
  assertSameOrigin,
  dbResult,
  parseBody,
  privateJson,
} from '@/lib/api'
import { requireAdmin } from '@/lib/auth'
import { memberPasswordSchema } from '@/lib/member-schema'
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
    const input = await parseBody(request, memberPasswordSchema)
    const member = dbResult(
      await db
        .from('profiles')
        .select('id')
        .eq('id', id)
        .eq('role', 'member')
        .maybeSingle(),
    )
    if (!member) throw new ApiError(404, 'Membro não encontrado')
    const { error } = await createAdminSupabase().auth.admin.updateUserById(
      id,
      { password: input.password },
    )
    if (error)
      throw new ApiError(
        422,
        'Não foi possível alterar a senha. Use de 8 a 128 caracteres.',
      )
    return privateJson({ ok: true })
  } catch (error) {
    return apiFailure(error)
  }
}

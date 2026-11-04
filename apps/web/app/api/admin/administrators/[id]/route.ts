import { z } from 'zod'
import {
  apiFailure,
  assertSameOrigin,
  dbResult,
  parseBody,
  privateJson,
  ApiError,
} from '@/lib/api'
import { requireAdmin } from '@/lib/auth'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { updateAdminSchema } from '@/lib/admin-schema'

type Context = { params: Promise<{ id: string }> }
export async function PATCH(request: Request, { params }: Context) {
  try {
    assertSameOrigin(request)
    const { db } = await requireAdmin()
    const id = z.uuid().parse((await params).id)
    const input = await parseBody(request, updateAdminSchema)
    const profile = dbResult(
      await db
        .from('profiles')
        .select('email,full_name')
        .eq('id', id)
        .eq('role', 'admin')
        .maybeSingle(),
    )
    if (!profile) throw new ApiError(404, 'Administrador não encontrado')
    const auth = createAdminSupabase()
    const result = await auth.auth.admin.updateUserById(id, {
      email: input.email,
      email_confirm: true,
      ...(input.password ? { password: input.password } : {}),
    })
    if (result.error)
      throw new ApiError(
        422,
        'Não foi possível alterar administrador. Confira o e-mail e a senha.',
      )
    const update = await db
      .from('profiles')
      .update({
        email: input.email,
        full_name: input.fullName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('role', 'admin')
      .select('id')
      .single()
    if (update.error && input.email !== profile.email)
      await auth.auth.admin.updateUserById(id, {
        email: profile.email,
        email_confirm: true,
      })
    dbResult(update)
    return privateJson({ ok: true })
  } catch (e) {
    return apiFailure(e)
  }
}
export async function DELETE(request: Request, { params }: Context) {
  try {
    assertSameOrigin(request)
    const { db, authUser } = await requireAdmin()
    const id = z.uuid().parse((await params).id)
    if (id === authUser.id)
      throw new ApiError(422, 'Não é permitido excluir o próprio administrador')
    const profile = dbResult(
      await db
        .from('profiles')
        .select('id')
        .eq('id', id)
        .eq('role', 'admin')
        .maybeSingle(),
    )
    if (!profile) throw new ApiError(404, 'Administrador não encontrado')
    // Auth deletion cascades atomically to profiles; the DB trigger guards the last admin.
    const result = await createAdminSupabase().auth.admin.deleteUser(id)
    if (result.error)
      throw new ApiError(
        409,
        'Não foi possível excluir. Mantenha pelo menos um administrador.',
      )
    return privateJson({ ok: true })
  } catch (e) {
    return apiFailure(e)
  }
}

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
import { createAdminSchema } from '@/lib/admin-schema'

export async function GET() {
  try {
    const { db, authUser } = await requireAdmin()
    const administrators = dbResult(
      await db
        .from('profiles')
        .select('id,email,full_name,created_at')
        .eq('role', 'admin')
        .order('created_at'),
    )
    return privateJson({ administrators, currentId: authUser.id })
  } catch (e) {
    return apiFailure(e)
  }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const { db } = await requireAdmin()
    const input = await parseBody(request, createAdminSchema)
    const auth = createAdminSupabase()
    const created = await auth.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
    })
    if (created.error || !created.data.user)
      throw new ApiError(
        422,
        'Não foi possível criar administrador. Confira e-mail e senha.',
      )
    const id = created.data.user.id
    const result = await db.from('profiles').insert({
      id,
      email: input.email,
      full_name: input.fullName,
      role: 'admin',
    })
    if (result.error) {
      const cleanup = await auth.auth.admin.deleteUser(id)
      if (cleanup.error)
        throw new ApiError(
          500,
          'Cadastro incompleto. Revise o usuário no Supabase.',
        )
      dbResult(result)
    }
    return privateJson({ id }, 201)
  } catch (e) {
    return apiFailure(e)
  }
}

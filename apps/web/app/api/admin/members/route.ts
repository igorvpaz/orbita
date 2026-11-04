import {
  ApiError,
  apiFailure,
  assertSameOrigin,
  dbResult,
  parseBody,
  privateJson,
} from '@/lib/api'
import { requireAdmin } from '@/lib/auth'
import { createAdminSupabase } from '@/lib/supabase/admin'
import { createMemberSchema } from '@/lib/member-schema'

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const { db } = await requireAdmin()
    const input = await parseBody(request, createMemberSchema)
    if (input.expiresAt && new Date(input.expiresAt) <= new Date())
      throw new ApiError(422, 'Expiração precisa ser futura')
    const [unit, plan] = await Promise.all([
      db
        .from('units')
        .select('id')
        .eq('id', input.unitId)
        .eq('active', true)
        .maybeSingle(),
      db
        .from('plans')
        .select('id')
        .eq('id', input.planId)
        .eq('active', true)
        .maybeSingle(),
    ])
    if (!dbResult(unit) || !dbResult(plan))
      throw new ApiError(422, 'Unidade ou plano inválido')
    const admin = createAdminSupabase()
    const { data, error } = await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
    })
    if (error || !data.user) {
      if (
        error?.code === 'email_exists' ||
        error?.code === 'email_already_exists'
      )
        throw new ApiError(409, 'Já existe usuário com este e-mail')
      throw new ApiError(
        422,
        'Não foi possível criar usuário. Confira e-mail e senha.',
      )
    }
    const result = await db.rpc('create_member_record', {
      new_user_id: data.user.id,
      new_email: input.email,
      new_name: input.fullName,
      new_unit_id: input.unitId,
      new_plan_id: input.planId,
      desired_status: input.initialStatus,
      expiry: input.expiresAt ?? null,
    })
    if (result.error) {
      // Compensate only the Auth account just created by this request.
      const cleanup = await admin.auth.admin.deleteUser(data.user.id)
      if (cleanup.error)
        throw new ApiError(
          500,
          'Cadastro incompleto. Revise o usuário no painel Supabase antes de tentar novamente.',
        )
      dbResult(result)
    }
    return privateJson({ id: data.user.id }, 201)
  } catch (error) {
    return apiFailure(error)
  }
}

export async function GET() {
  try {
    const { db } = await requireAdmin()
    const [profiles, memberships, units, plans] = await Promise.all([
      db
        .from('profiles')
        .select('id,email,full_name,unit_id,created_at')
        .eq('role', 'member')
        .order('created_at', { ascending: false })
        .limit(200),
      db
        .from('memberships')
        .select('user_id,plan_id,status,starts_at,expires_at'),
      db.from('units').select('id,name'),
      db.from('plans').select('id,name'),
    ])
    const allMemberships = dbResult(memberships)
    const allUnits = dbResult(units)
    const allPlans = dbResult(plans)
    return privateJson({
      members: dbResult(profiles).map((profile) => ({
        ...profile,
        membership:
          allMemberships.find((item) => item.user_id === profile.id) ?? null,
        unit_name:
          allUnits.find((item) => item.id === profile.unit_id)?.name ?? '',
        plan_name:
          allPlans.find(
            (item) =>
              item.id ===
              allMemberships.find((m) => m.user_id === profile.id)?.plan_id,
          )?.name ?? '',
      })),
    })
  } catch (error) {
    return apiFailure(error)
  }
}

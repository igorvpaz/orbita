import { ApiError, dbResult } from '@/lib/api'
import { createServerSupabase } from '@/lib/supabase/server'

export async function getCurrentUser() {
  const db = await createServerSupabase()
  const { data: auth, error } = await db.auth.getUser()
  if (error || !auth.user) throw new ApiError(401, 'Faça login para continuar')
  const profile = dbResult(
    await db
      .from('profiles')
      .select('id,email,full_name,role,unit_id,preferred_locale')
      .eq('id', auth.user.id)
      .maybeSingle(),
  )
  if (!profile) throw new ApiError(403, 'Perfil não configurado')
  return { db, authUser: auth.user, profile }
}

export async function requireAdmin() {
  const current = await getCurrentUser()
  if (current.profile.role !== 'admin')
    throw new ApiError(403, 'Acesso administrativo necessário')
  return current
}

export async function getMemberState() {
  const current = await getCurrentUser()
  if (current.profile.role !== 'member')
    throw new ApiError(403, 'Acesso de membro necessário')
  const membership = dbResult(
    await current.db
      .from('memberships')
      .select('id,plan_id,status,starts_at,expires_at')
      .eq('user_id', current.authUser.id)
      .maybeSingle(),
  )
  const active =
    !!membership &&
    membership.status === 'active' &&
    new Date(membership.starts_at) <= new Date() &&
    (!membership.expires_at || new Date(membership.expires_at) > new Date())
  return { ...current, membership, active }
}

export async function requireActiveMember() {
  const state = await getMemberState()
  if (!state.active || !state.membership)
    throw new ApiError(403, 'Assinatura inativa ou expirada')
  return { ...state, membership: state.membership }
}

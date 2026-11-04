import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'

if (existsSync('.env.test.local')) loadEnvFile('.env.test.local')

const enabled =
  process.env.RUN_RLS_TESTS === '1' &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ) &&
  !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
  !!process.env.SUPABASE_SECRET_KEY

describe.skipIf(!enabled)('RLS em banco descartável', () => {
  let admin: SupabaseClient
  let member: SupabaseClient
  let anon: SupabaseClient
  let memberId = ''
  let serviceId = ''
  let unitId = ''
  let partnerId = ''
  let adminId = ''
  const email = `rls-${crypto.randomUUID()}@example.invalid`
  const password = `RlsTest!${crypto.randomUUID()}`

  beforeAll(async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    admin = createClient(url, process.env.SUPABASE_SECRET_KEY!, {
      auth: { persistSession: false },
    })
    anon = createClient(url, key, { auth: { persistSession: false } })
    member = createClient(url, key, { auth: { persistSession: false } })
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (created.error || !created.data.user)
      throw created.error ?? new Error('Usuário de teste ausente')
    memberId = created.data.user.id
    const adminEmail = `rls-admin-${crypto.randomUUID()}@example.invalid`
    const adminUser = await admin.auth.admin.createUser({
      email: adminEmail,
      password: `RlsAdmin!${crypto.randomUUID()}`,
      email_confirm: true,
    })
    if (adminUser.error || !adminUser.data.user)
      throw adminUser.error ?? new Error('Admin de teste ausente')
    adminId = adminUser.data.user.id
    const adminProfile = await admin.from('profiles').insert({
      id: adminId,
      email: adminEmail,
      full_name: 'Admin RLS',
      role: 'admin',
    })
    if (adminProfile.error) throw adminProfile.error
    const unit = await admin
      .from('units')
      .insert({ name: 'Teste RLS', slug: `rls-${crypto.randomUUID()}` })
      .select('id')
      .single()
    if (unit.error) throw unit.error
    unitId = unit.data.id
    const plan = await admin
      .from('plans')
      .select('id')
      .eq('code', 'basic')
      .single()
    if (plan.error) throw plan.error
    const profile = await admin.from('profiles').insert({
      id: memberId,
      email,
      full_name: 'Teste RLS',
      role: 'member',
      unit_id: unitId,
    })
    if (profile.error) throw profile.error
    const membership = await admin
      .from('memberships')
      .insert({ user_id: memberId, plan_id: plan.data.id, status: 'inactive' })
    if (membership.error) throw membership.error
    const partner = await admin
      .from('partners')
      .insert({ name: 'Parceiro RLS', unit_id: unitId })
      .select('id')
      .single()
    if (partner.error) throw partner.error
    partnerId = partner.data.id
    const service = await admin
      .from('services')
      .insert({
        unit_id: unitId,
        partner_id: partnerId,
        name: 'Serviço RLS',
        description_pt: 'Descrição de teste RLS',
        price_cents: 1250,
        category: 'teste',
        status: 'published',
      })
      .select('id')
      .single()
    if (service.error) throw service.error
    serviceId = service.data.id
    const signed = await member.auth.signInWithPassword({ email, password })
    if (signed.error) throw signed.error
  })

  afterAll(async () => {
    if (!admin || !memberId) return
    await admin
      .from('audit_logs')
      .delete()
      .in('actor_user_id', [memberId, adminId])
    if (serviceId) await admin.from('services').delete().eq('id', serviceId)
    if (partnerId) await admin.from('partners').delete().eq('id', partnerId)
    await admin.from('memberships').delete().eq('user_id', memberId)
    await admin.from('profiles').delete().eq('id', memberId)
    if (adminId) await admin.from('profiles').delete().eq('id', adminId)
    if (unitId) await admin.from('units').delete().eq('id', unitId)
    await admin.auth.admin.deleteUser(memberId)
    if (adminId) await admin.auth.admin.deleteUser(adminId)
  })

  it('nega dados privados ao anônimo', async () => {
    expect((await anon.from('profiles').select('id')).data ?? []).toHaveLength(
      0,
    )
    expect((await anon.from('services').select('id')).data ?? []).toHaveLength(
      0,
    )
  })

  it('nega catálogo ao membro inativo e impede alteração de role e assinatura', async () => {
    expect(
      (await member.from('services').select('id').eq('id', serviceId)).data ??
        [],
    ).toHaveLength(0)
    await member
      .from('memberships')
      .update({ status: 'active' })
      .eq('user_id', memberId)
    await member.from('profiles').update({ role: 'admin' }).eq('id', memberId)
    expect(
      (
        await admin
          .from('memberships')
          .select('status')
          .eq('user_id', memberId)
          .single()
      ).data?.status,
    ).toBe('inactive')
    expect(
      (await admin.from('profiles').select('role').eq('id', memberId).single())
        .data?.role,
    ).toBe('member')
  })

  it('nega aceite legado e só admin ativa a assinatura; rejeita preço forjado', async () => {
    expect((await member.rpc('accept_invitation')).error).not.toBeNull()
    const activated = await admin
      .from('memberships')
      .update({ status: 'active' })
      .eq('user_id', memberId)
    expect(activated.error).toBeNull()
    expect(
      (await member.from('services').select('id').eq('id', serviceId)).data,
    ).toHaveLength(1)
    expect(
      (await member.from('partner_terms').select('id')).data ?? [],
    ).toHaveLength(0)
    const forged = await member.from('orders').insert({
      member_id: memberId,
      service_id: serviceId,
      idempotency_key: crypto.randomUUID(),
      unit_price_cents: 1,
      total_cents: 1,
      status: 'confirmed',
      unit_id: unitId,
    })
    expect(forged.error).not.toBeNull()
  })
})

import { apiFailure, dbResult, privateJson } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { db } = await requireAdmin()
    const days = new URL(request.url).searchParams.get('days') === '7' ? 7 : 30
    const since = new Date(Date.now() - days * 86_400_000).toISOString()
    const [views, interests, requested, confirmed, value, latest] =
      await Promise.all([
        db
          .from('service_events')
          .select('id', { count: 'exact', head: true })
          .eq('type', 'view')
          .gte('occurred_at', since),
        db
          .from('service_events')
          .select('id', { count: 'exact', head: true })
          .eq('type', 'interest')
          .gte('occurred_at', since),
        db
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', since),
        db
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'confirmed')
          .gte('created_at', since),
        db.rpc('admin_confirmed_value', { since_time: since }),
        db
          .from('orders')
          .select('id,status,total_cents,created_at,member_id,service_id')
          .order('created_at', { ascending: false })
          .limit(10),
      ])
    for (const result of [views, interests, requested, confirmed])
      if (result.error) throw result.error
    const latestOrders = dbResult(latest)
    const serviceIds = [
      ...new Set(latestOrders.map((order) => order.service_id)),
    ]
    const memberIds = [...new Set(latestOrders.map((order) => order.member_id))]
    const [services, members] = await Promise.all([
      serviceIds.length
        ? db.from('services').select('id,name').in('id', serviceIds)
        : Promise.resolve({ data: [], error: null }),
      memberIds.length
        ? db.from('profiles').select('id,full_name').in('id', memberIds)
        : Promise.resolve({ data: [], error: null }),
    ])
    const serviceNames = dbResult(services)
    const memberNames = dbResult(members)
    return privateJson({
      days,
      views: views.count ?? 0,
      interests: interests.count ?? 0,
      orders_requested: requested.count ?? 0,
      orders_confirmed: confirmed.count ?? 0,
      nominal_confirmed_cents: dbResult(value) ?? 0,
      latest_orders: latestOrders.map((order) => ({
        ...order,
        service_name:
          serviceNames.find((service) => service.id === order.service_id)
            ?.name ?? 'Serviço',
        member_name:
          memberNames.find((member) => member.id === order.member_id)
            ?.full_name ?? null,
      })),
    })
  } catch (error) {
    return apiFailure(error)
  }
}

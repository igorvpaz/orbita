'use client'
import { useEffect, useState } from 'react'
import { ContentSkeleton } from '@/components/loading-skeleton'
import { apiRequest } from '@/components/api-client'
type Order = {
  id: string
  service_name: string
  status: string
  total_cents: number
  created_at: string
}
export function MemberOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    void apiRequest<{
      orders: Order[]
    }>('/api/orders')
      .then((data) => setOrders(data.orders))
      .catch((cause) => setError(cause.message))
  }, [])
  const labels: Record<string, string> = {
    requested: 'Solicitado',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
  }
  return (
    <div className="admin-workspace member-orders">
      <header className="workspace-heading">
        <h1>{'Meus pedidos'}</h1>
      </header>
      {error && (
        <p role="alert" className="text-[#a54a35]">
          {error}
        </p>
      )}
      {orders === null && !error && <ContentSkeleton variant="orders" />}
      {orders?.map((order) => (
        <article
          key={order.id}
          className="rounded-2xl border border-[#e7e7df] bg-white p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">{order.service_name}</h2>
            <span className="rounded-full bg-[#edf5e8] px-3 py-1 text-xs text-[#937728]">
              {labels[order.status] ?? order.status}
            </span>
          </div>
          <p className="mt-3 text-sm text-[#77796d]">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(order.total_cents / 100)}{' '}
            · {new Date(order.created_at).toLocaleDateString('pt-BR')}
          </p>
        </article>
      ))}
      {orders?.length === 0 && (
        <p className="rounded-2xl border border-[#e7e7df] p-6 text-[#77796d]">
          {'Você ainda não tem pedidos.'}
        </p>
      )}
    </div>
  )
}

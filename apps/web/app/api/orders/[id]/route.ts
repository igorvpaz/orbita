import { z } from 'zod'
import {
  assertSameOrigin,
  apiFailure,
  ApiError,
  dbResult,
  parseBody,
  privateJson,
} from '@/lib/api'
import { requireAdmin } from '@/lib/auth'

const schema = z.object({ status: z.enum(['confirmed', 'cancelled']) })

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request)
    const { db } = await requireAdmin()
    const { id } = await params
    const input = await parseBody(request, schema)
    const existing = dbResult(
      await db.from('orders').select('id,status').eq('id', id).maybeSingle(),
    )
    if (!existing) throw new ApiError(404, 'Pedido não encontrado')
    if (existing.status !== 'requested')
      throw new ApiError(409, 'Pedido já resolvido')
    const order = dbResult(
      await db
        .from('orders')
        .update({ status: input.status })
        .eq('id', id)
        .eq('status', 'requested')
        .select('id,status,total_cents')
        .single(),
    )
    return privateJson({ order })
  } catch (error) {
    return apiFailure(error)
  }
}

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

const schema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  terms: z
    .object({
      contactEmail: z.union([z.email(), z.literal('')]).optional(),
      commissionPercent: z.number().min(0).max(100).nullable(),
      fixedFeeCents: z.number().int().min(0).nullable(),
      notes: z.string().max(2000),
      validFrom: z.iso.date(),
      validUntil: z.iso.date().nullable(),
    })
    .optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request)
    const { db } = await requireAdmin()
    const { id } = await params
    const input = await parseBody(request, schema)
    if (
      !input.name &&
      input.description === undefined &&
      !input.status &&
      !input.terms
    )
      throw new ApiError(422, 'Nenhuma alteração')
    if (
      input.terms?.validUntil &&
      input.terms.validUntil < input.terms.validFrom
    )
      throw new ApiError(422, 'Vigência inválida')
    const existing = dbResult(
      await db.from('partners').select('id').eq('id', id).maybeSingle(),
    )
    if (!existing) throw new ApiError(404, 'Parceiro não encontrado')
    const changes = {
      name: input.name,
      description: input.description,
      status: input.status,
      updated_at: new Date().toISOString(),
    }
    dbResult(await db.from('partners').update(changes).eq('id', id))
    if (input.terms)
      dbResult(
        await db.from('partner_terms').insert({
          partner_id: id,
          contact_email: input.terms.contactEmail || null,
          commission_percent: input.terms.commissionPercent,
          fixed_fee_cents: input.terms.fixedFeeCents,
          notes: input.terms.notes,
          valid_from: input.terms.validFrom,
          valid_until: input.terms.validUntil,
        }),
      )
    return privateJson({ ok: true })
  } catch (error) {
    return apiFailure(error)
  }
}

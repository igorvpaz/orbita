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

const partnerSchema = z.object({
  unitId: z.uuid(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).default(''),
  contactEmail: z.union([z.email(), z.literal('')]).optional(),
  commissionPercent: z.number().min(0).max(100).nullable().default(null),
  fixedFeeCents: z.number().int().min(0).nullable().default(null),
  notes: z.string().max(2000).default(''),
  validFrom: z.iso.date(),
  validUntil: z.iso.date().nullable().default(null),
})

export async function GET() {
  try {
    const { db } = await requireAdmin()
    const [partners, terms] = await Promise.all([
      db
        .from('partners')
        .select('id,unit_id,name,description,status,created_at')
        .order('created_at', { ascending: false }),
      db
        .from('partner_terms')
        .select(
          'id,partner_id,contact_email,commission_percent,fixed_fee_cents,notes,valid_from,valid_until',
        )
        .order('valid_from', { ascending: false }),
    ])
    const allTerms = dbResult(terms)
    return privateJson({
      partners: dbResult(partners).map((partner) => ({
        ...partner,
        terms: allTerms.filter((term) => term.partner_id === partner.id),
      })),
    })
  } catch (error) {
    return apiFailure(error)
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const { db } = await requireAdmin()
    const input = await parseBody(request, partnerSchema)
    if (input.validUntil && input.validUntil < input.validFrom)
      throw new ApiError(422, 'Vigência inválida')
    const unit = dbResult(
      await db
        .from('units')
        .select('id')
        .eq('id', input.unitId)
        .eq('active', true)
        .maybeSingle(),
    )
    if (!unit) throw new ApiError(422, 'Unidade inválida')
    const partner = dbResult(
      await db
        .from('partners')
        .insert({
          unit_id: input.unitId,
          name: input.name,
          description: input.description,
        })
        .select('id')
        .single(),
    )
    const term = await db.from('partner_terms').insert({
      partner_id: partner.id,
      contact_email: input.contactEmail || null,
      commission_percent: input.commissionPercent,
      fixed_fee_cents: input.fixedFeeCents,
      notes: input.notes,
      valid_from: input.validFrom,
      valid_until: input.validUntil,
    })
    if (term.error) {
      await db
        .from('partners')
        .update({ status: 'inactive' })
        .eq('id', partner.id)
      throw new ApiError(
        500,
        'Parceiro criado inativo; condição comercial falhou. Revise no painel.',
      )
    }
    return privateJson({ id: partner.id }, 201)
  } catch (error) {
    return apiFailure(error)
  }
}

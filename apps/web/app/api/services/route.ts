import { apiFailure, dbResult, privateJson } from '@/lib/api'
import { getCurrentUser } from '@/lib/auth'
import { getMemberCatalog } from '@/lib/catalog'

export async function GET(request: Request) {
  try {
    const current = await getCurrentUser()
    if (current.profile.role === 'admin') {
      const services = dbResult(
        await current.db
          .from('services')
          .select(
            'id,name,description_pt,description_en,price_cents,category,status,unit_id,partner_id',
          )
          .order('created_at', { ascending: false })
          .limit(200),
      )
      return privateJson({ services })
    }
    return privateJson(
      await getMemberCatalog(
        new URL(request.url).searchParams.get('unitId') ?? undefined,
      ),
    )
  } catch (error) {
    return apiFailure(error)
  }
}

import { apiFailure, dbResult, privateJson } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const { db } = await requireAdmin()
    const [units, plans] = await Promise.all([
      db.from('units').select('id,name,slug').eq('active', true).order('name'),
      db.from('plans').select('id,code,name').eq('active', true).order('name'),
    ])
    return privateJson({ units: dbResult(units), plans: dbResult(plans) })
  } catch (error) {
    return apiFailure(error)
  }
}

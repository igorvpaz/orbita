import { apiFailure, dbResult, privateJson, ApiError } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'
import { reportPeriod } from '@/lib/report-period'
export async function GET(request: Request) {
  try {
    const { db } = await requireAdmin()
    let range
    try {
      range = reportPeriod(new URL(request.url).searchParams)
    } catch {
      throw new ApiError(422, 'Período inválido')
    }
    return privateJson(
      dbResult(
        await db.rpc('admin_dashboard', {
          period_start: range.from,
          period_end: range.to,
        }),
      ),
    )
  } catch (e) {
    return apiFailure(e)
  }
}

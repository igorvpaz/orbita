import { apiFailure, privateJson } from '@/lib/api'
import { getMemberCatalog } from '@/lib/catalog'

export async function GET(request: Request) {
  try {
    return privateJson(
      await getMemberCatalog(
        new URL(request.url).searchParams.get('unitId') ?? undefined,
      ),
    )
  } catch (error) {
    return apiFailure(error)
  }
}

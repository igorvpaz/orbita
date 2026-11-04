import { apiFailure, assertSameOrigin, privateJson } from '@/lib/api'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    await requireAdmin()
    return privateJson(
      {
        error:
          'Convites por e-mail desativados. Crie o membro no painel administrativo.',
      },
      410,
    )
  } catch (error) {
    return apiFailure(error)
  }
}

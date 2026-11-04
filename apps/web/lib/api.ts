import { ZodError, type ZodType } from 'zod'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export function privateJson(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  })
}

export function apiFailure(error: unknown) {
  if (error instanceof ApiError)
    return privateJson({ error: error.message }, error.status)
  if (error instanceof ZodError)
    return privateJson({ error: 'Dados inválidos', issues: error.issues }, 422)
  console.error('api_error', error instanceof Error ? error.message : 'unknown')
  return privateJson({ error: 'Erro interno' }, 500)
}

export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  const length = Number(request.headers.get('content-length') ?? '0')
  if (length > 64_000) throw new ApiError(413, 'Corpo muito grande')
  let value: unknown
  try {
    value = await request.json()
  } catch {
    throw new ApiError(400, 'JSON inválido')
  }
  return schema.parse(value)
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  const expected = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL
  if (!origin || !expected || origin !== new URL(expected).origin)
    throw new ApiError(403, 'Origem não autorizada')
}

export function dbResult<T>(result: {
  data: T
  error: { message: string; code?: string } | null
}): NonNullable<T> {
  if (result.error) {
    if (result.error.code === '23505')
      throw new ApiError(409, 'Registro duplicado')
    if (result.error.code === '42501')
      throw new ApiError(403, 'Acesso não autorizado')
    if (result.error.code === '23514')
      throw new ApiError(422, 'Regra de negócio inválida')
    if (result.error.code === 'P0001')
      throw new ApiError(429, 'Limite de operações atingido')
    console.error('database_error', result.error.code ?? 'unknown')
    throw new ApiError(500, 'Falha ao acessar dados')
  }
  return result.data as NonNullable<T>
}

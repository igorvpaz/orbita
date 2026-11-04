export async function apiRequest<T>(
  path: string,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok)
    throw new Error(payload.error ?? 'Não foi possível concluir')
  return payload as T
}

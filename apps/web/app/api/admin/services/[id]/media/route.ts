import {
  assertSameOrigin,
  apiFailure,
  ApiError,
  dbResult,
  privateJson,
} from '@/lib/api'
import { requireAdmin } from '@/lib/auth'

function imageType(bytes: Uint8Array) {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  )
    return { mime: 'image/jpeg', ext: 'jpg' }
  if (
    bytes.length >= 8 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every(
      (value, index) => bytes[index] === value,
    )
  )
    return { mime: 'image/png', ext: 'png' }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  )
    return { mime: 'image/webp', ext: 'webp' }
  return null
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request)
    const { db } = await requireAdmin()
    const { id } = await params
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ApiError(422, 'ID inválido')
    if (Number(request.headers.get('content-length') ?? 0) > 6_000_000)
      throw new ApiError(413, 'Arquivo muito grande')
    const form = await request.formData()
    const file = form.get('file')
    const altPt = String(form.get('altPt') ?? '').trim()
    if (!(file instanceof File) || file.size < 1 || file.size > 5_242_880)
      throw new ApiError(422, 'Imagem inválida ou acima de 5 MB')
    if (altPt.length < 2 || altPt.length > 160)
      throw new ApiError(422, 'Texto alternativo inválido')
    const service = dbResult(
      await db.from('services').select('id').eq('id', id).maybeSingle(),
    )
    if (!service) throw new ApiError(404, 'Serviço não encontrado')
    const buffer = new Uint8Array(await file.arrayBuffer())
    const type = imageType(buffer)
    if (!type || file.type !== type.mime)
      throw new ApiError(422, 'Use JPG, PNG ou WebP válido')
    const path = `${id}/${crypto.randomUUID()}.${type.ext}`
    const upload = await db.storage
      .from('service-images')
      .upload(path, buffer, { contentType: type.mime, upsert: false })
    if (upload.error) throw new ApiError(500, 'Falha ao enviar imagem')
    const inserted = await db
      .from('service_media')
      .insert({ service_id: id, storage_path: path, alt_pt: altPt })
      .select('id')
      .single()
    if (inserted.error) {
      await db.storage.from('service-images').remove([path])
      throw new ApiError(500, 'Falha ao registrar imagem')
    }
    return privateJson({ id: inserted.data.id }, 201)
  } catch (error) {
    return apiFailure(error)
  }
}

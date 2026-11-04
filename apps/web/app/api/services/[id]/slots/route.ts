import { z } from 'zod'
import { apiFailure, dbResult, privateJson } from '@/lib/api'
import { requireActiveMember } from '@/lib/auth'
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { db } = await requireActiveMember()
    const id = z.uuid().parse((await params).id)
    const day = z.iso
      .date()
      .parse(new URL(request.url).searchParams.get('date'))
    return privateJson({
      slots: dbResult(
        await db.rpc('service_booking_slots', {
          service_uuid: id,
          booking_day: day,
        }),
      ),
    })
  } catch (e) {
    return apiFailure(e)
  }
}

import { createServerSupabase } from '@/lib/supabase/server'
import { assertSameOrigin, apiFailure, privateJson } from '@/lib/api'

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const db = await createServerSupabase()
    const { error } = await db.auth.signOut()
    if (error) throw error
    return privateJson({ ok: true })
  } catch (error) {
    return apiFailure(error)
  }
}

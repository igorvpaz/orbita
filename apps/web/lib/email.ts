import 'server-only'
import { Resend } from 'resend'
import { createAdminSupabase } from '@/lib/supabase/admin'

type DeliveryKind = 'invite' | 'interest_alert' | 'order_alert'

export async function sendTrackedEmail(input: {
  kind: DeliveryKind
  recipient: string
  relatedId: string
  subject: string
  text: string
  html: string
}) {
  let status: 'sent' | 'failed' = 'failed'
  let providerMessageId: string | null = null
  let errorCode: string | null = null
  try {
    const key = process.env.RESEND_API_KEY
    const from = process.env.EMAIL_FROM
    if (!key || !from) throw new Error('email_not_configured')
    const result = await new Resend(key).emails.send(
      {
        from,
        to: input.recipient,
        subject: input.subject,
        text: input.text,
        html: input.html,
      },
      { signal: AbortSignal.timeout(5_000) },
    )
    if (result.error) throw new Error(result.error.name || 'provider_error')
    status = 'sent'
    providerMessageId = result.data?.id ?? null
  } catch (error) {
    errorCode = error instanceof Error ? error.message.slice(0, 80) : 'unknown'
    console.error('email_delivery_failed', input.kind, errorCode)
  }
  try {
    const { error: logError } = await createAdminSupabase()
      .from('email_deliveries')
      .insert({
        kind: input.kind,
        recipient: input.recipient,
        related_id: input.relatedId,
        status,
        provider_message_id: providerMessageId,
        error_code: errorCode,
      })
    if (logError) console.error('email_delivery_log_failed', logError.code)
  } catch {
    console.error('email_delivery_log_failed', 'configuration')
  }
  return status
}

export function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ]!,
  )
}

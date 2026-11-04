import { escapeHtml, sendTrackedEmail } from '@/lib/email'
import { ApiError, dbResult } from '@/lib/api'
import { createAdminSupabase } from '@/lib/supabase/admin'

export async function deliverInvitation(
  invitation: {
    id: string
    email: string
    invited_user_id: string
    status: string
    attempt_count: number
  },
  resend = false,
) {
  if (!['pending', 'delivery_failed'].includes(invitation.status))
    throw new ApiError(409, 'Convite não pode ser reenviado')
  if (invitation.attempt_count >= 5)
    throw new ApiError(429, 'Limite de envio atingido')
  const admin = createAdminSupabase()
  const type = resend ? 'magiclink' : 'invite'
  const generated = await admin.auth.admin.generateLink({
    type,
    email: invitation.email,
  })
  if (
    generated.error ||
    !generated.data.properties?.hashed_token ||
    !generated.data.user?.id
  ) {
    throw new ApiError(502, 'Não foi possível gerar o convite')
  }
  if (generated.data.user.id !== invitation.invited_user_id)
    throw new ApiError(409, 'O convite pertence a outro usuário')
  const base = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL
  if (!base) throw new ApiError(500, 'URL do site ausente')
  const link = new URL('/auth/confirm', base)
  link.searchParams.set('token_hash', generated.data.properties.hashed_token)
  link.searchParams.set('type', type)
  const emailStatus = await sendTrackedEmail({
    kind: 'invite',
    recipient: invitation.email,
    relatedId: invitation.id,
    subject: 'Seu convite para a Órbita',
    text: `Você foi convidado para a Órbita. Aceite o convite: ${link.toString()}`,
    html: `<p>Você foi convidado para a Órbita.</p><p><a href="${escapeHtml(link.toString())}">Aceitar convite</a></p><p>Este link expira e pode ser usado uma vez.</p>`,
  })
  dbResult(
    await admin
      .from('invitations')
      .update({
        status: emailStatus === 'sent' ? 'pending' : 'delivery_failed',
        attempt_count: invitation.attempt_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invitation.id),
  )
  return { status: emailStatus, userId: generated.data.user.id }
}

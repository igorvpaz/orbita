'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase/browser'
import { apiRequest } from '@/components/api-client'

export function PasswordForm({ invitation = false }: { invitation?: boolean }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const { error } = await createBrowserSupabase().auth.updateUser({
        password,
      })
      if (error) throw error
      if (invitation) await apiRequest('/api/auth/accept-invite', 'POST')
      const response = await apiRequest<{
        profile: { role: 'admin' | 'member' }
      }>('/api/me')
      router.replace(response.profile.role === 'admin' ? '/admin' : '/member')
      router.refresh()
    } catch {
      setMessage(
        'Link inválido ou expirado. Solicite outro convite ou recuperação.',
      )
      setBusy(false)
    }
  }
  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6"
    >
      <label className="block text-sm">
        Senha (mínimo 8 caracteres)
        <input
          className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-900 p-3"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {message && (
        <p role="alert" className="text-amber-200">
          {message}
        </p>
      )}
      <button
        disabled={busy}
        className="w-full rounded-xl bg-teal-300 p-3 font-bold text-slate-950 disabled:opacity-50"
      >
        {busy ? 'Aguarde...' : 'Salvar senha'}
      </button>
    </form>
  )
}

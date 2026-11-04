'use client'
import { useLanguage } from '@/components/language-provider'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase/browser'
import { destinationForRole } from '@/lib/auth-navigation'
export function LoginForm({
  next,
  linkError,
}: {
  next?: string
  linkError?: boolean
}) {
  const { t } = useLanguage()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState(
    linkError ? 'Link inválido ou expirado. Solicite outro.' : '',
  )
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const auth = createBrowserSupabase().auth
      const { data, error } = await auth.signInWithPassword({ email, password })
      if (error || !data.user) {
        setMessage('E-mail ou senha inválidos.')
        setBusy(false)
        return
      }
      const response = await fetch('/api/me', { cache: 'no-store' })
      const me = await response.json()
      if (!response.ok) {
        setMessage('Conta ainda não configurada.')
        setBusy(false)
        return
      }
      router.replace(destinationForRole(me.profile.role, next))
      router.refresh()
    } catch {
      setMessage('Não foi possível conectar. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <form onSubmit={submit} className="login-form">
      <label htmlFor="login-email">{t('E-mail')}</label>
      <input
        id="login-email"
        name="email"
        placeholder={t('seu@email.com')}
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label htmlFor="login-password">{t('Senha')}</label>
      <div className="login-password-field">
        <input
          id="login-password"
          name="password"
          placeholder={t('Sua senha')}
          type={showPassword ? 'text' : 'password'}
          required
          minLength={8}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="login-password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? t('Ocultar senha') : t('Mostrar senha')}
          aria-pressed={showPassword}
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {showPassword && <path d="m3 3 18 18" />}
          </svg>
        </button>
      </div>
      {message && (
        <p role="alert" className="login-feedback">
          {t(message)}
        </p>
      )}
      <button disabled={busy} className="login-submit">
        {busy ? t('Entrando…') : t('Entrar')}
      </button>
      <div className="login-form-footer">
        <p>{t('Esqueceu a senha? Fale com o administrador.')}</p>
        <span>{t('Apenas usuários cadastrados')}</span>
      </div>
    </form>
  )
}

import { PasswordForm } from '@/components/password-form'

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <p className="text-sm font-bold uppercase tracking-[0.35em] text-teal-300">
        Órbita
      </p>
      <h1 className="text-3xl font-bold">Nova senha</h1>
      <PasswordForm />
    </main>
  )
}

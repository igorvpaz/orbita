'use client'
import { createContext, useContext, useEffect, useState } from 'react'
type InstallEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}
type PwaState = {
  installed: boolean
  secure: boolean
  ready: boolean
  available: boolean
  error: string
  install: () => Promise<void>
}
const Context = createContext<PwaState>({
  installed: false,
  secure: false,
  ready: false,
  available: false,
  error: '',
  install: async () => {},
})
export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null)
  const [state, setState] = useState({
    installed: false,
    secure: false,
    ready: false,
    error: '',
  })
  useEffect(() => {
    const display = window.matchMedia('(display-mode: standalone)')
    const update = () =>
      setState((s) => ({
        ...s,
        installed:
          display.matches ||
          !!(navigator as Navigator & { standalone?: boolean }).standalone,
        secure: window.isSecureContext,
        ready: true,
      }))
    const timer = setTimeout(update, 0)
    const capture = (event: Event) => {
      event.preventDefault()
      setPrompt(event as InstallEvent)
    }
    const installed = () => {
      setPrompt(null)
      setState((s) => ({ ...s, installed: true }))
    }
    window.addEventListener('beforeinstallprompt', capture)
    window.addEventListener('appinstalled', installed)
    display.addEventListener('change', update)
    if ('serviceWorker' in navigator && window.isSecureContext) {
      void navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .catch(() =>
          setState((s) => ({
            ...s,
            error:
              'Não foi possível preparar o aplicativo. Recarregue a página com conexão.',
          })),
        )
    }
    return () => {
      clearTimeout(timer)
      window.removeEventListener('beforeinstallprompt', capture)
      window.removeEventListener('appinstalled', installed)
      display.removeEventListener('change', update)
    }
  }, [])
  async function install() {
    if (!prompt) return
    try {
      await prompt.prompt()
      await prompt.userChoice
      setPrompt(null)
    } catch {
      setState((s) => ({
        ...s,
        error: 'Use o menu do navegador para instalar o aplicativo.',
      }))
      setPrompt(null)
    }
  }
  return (
    <Context.Provider value={{ ...state, available: !!prompt, install }}>
      {children}
    </Context.Provider>
  )
}
export function usePwa() {
  return useContext(Context)
}

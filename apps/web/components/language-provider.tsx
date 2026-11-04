'use client'
import { createContext, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import { languages, languageNames, translate, type Language } from '@/lib/i18n'
const Context = createContext({
  language: 'pt-BR' as Language,
  change: (_language: Language) => {
    void _language
  },
})
export function LanguageProvider({
  language: initial,
  children,
}: {
  language: Language
  children: React.ReactNode
}) {
  const [language, setLanguage] = useState(initial)
  const router = useRouter()
  function change(next: Language) {
    setLanguage(next)
    document.cookie = `orbita_locale=${next}; Path=/; SameSite=Lax; Max-Age=31536000${location.protocol === 'https:' ? '; Secure' : ''}`
    document.documentElement.lang = next
    router.refresh()
  }
  return (
    <Context.Provider value={{ language, change }}>{children}</Context.Provider>
  )
}
export function useLanguage() {
  const context = useContext(Context)
  return {
    ...context,
    t: (source: string | number | null | undefined, fallback?: string) =>
      translate(context.language, source, fallback),
    locale: context.language,
  }
}
export function LanguageSelect() {
  const { language, change, t } = useLanguage()
  return (
    <label className="language-select">
      <span className="sr-only">{t('Idioma')}</span>
      <select
        aria-label={t('Idioma')}
        value={language}
        onChange={(e) => change(e.target.value as Language)}
      >
        {languages.map((l) => (
          <option key={l} value={l}>
            {languageNames[l]}
          </option>
        ))}
      </select>
    </label>
  )
}

'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
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
  const disclosure = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    function dismiss(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !disclosure.current?.contains(event.target)
      ) {
        if (disclosure.current) disclosure.current.open = false
      }
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [])
  const abbreviation = (value: Language) =>
    value === 'pt-BR' ? 'PT' : value.toUpperCase()
  return (
    <details
      className="language-select"
      ref={disclosure}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && disclosure.current?.open) {
          event.preventDefault()
          event.stopPropagation()
          disclosure.current.open = false
          disclosure.current.querySelector('summary')?.focus()
        }
      }}
    >
      <summary
        aria-label={`${t('Idioma')}: ${languageNames[language]}`}
        title={t('Idioma')}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z" />
        </svg>
        <span>{abbreviation(language)}</span>
      </summary>
      <div className="language-options" aria-label={t('Idioma')}>
        {languages.map((l) => (
          <button
            key={l}
            type="button"
            lang={l}
            aria-pressed={language === l}
            onClick={() => {
              change(l)
              if (disclosure.current) {
                disclosure.current.open = false
                disclosure.current.querySelector('summary')?.focus()
              }
            }}
          >
            <span>{abbreviation(l)}</span>
            {languageNames[l]}
          </button>
        ))}
      </div>
    </details>
  )
}

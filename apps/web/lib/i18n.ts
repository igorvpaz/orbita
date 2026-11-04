import { translations } from './translations'
export const languages = ['pt-BR', 'en', 'es', 'fr', 'de', 'it'] as const
export type Language = (typeof languages)[number]
export const languageNames: Record<Language, string> = {
  'pt-BR': 'Português',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
}
export function languageFrom(
  value: string | undefined | null,
): Language | undefined {
  const first = value?.split('-')[0].toLowerCase()
  return first === 'pt' ? 'pt-BR' : languages.find((l) => l === first)
}
export function translate(
  language: Language,
  source: string | number | null | undefined,
  fallback?: string,
): string {
  const text = String(source ?? '')
  if (language === 'pt-BR') return text
  const translated =
    translations[text.trim()]?.[languages.indexOf(language) - 1]
  return translated
    ? text.replace(text.trim(), translated)
    : fallback
      ? (translations[fallback]?.[languages.indexOf(language) - 1] ?? fallback)
      : text
}

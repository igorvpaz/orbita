import 'server-only'
import { cookies, headers } from 'next/headers'
import { languageFrom, translate } from './i18n'
export async function requestLanguage() {
  const saved = languageFrom((await cookies()).get('orbita_locale')?.value)
  if (saved) return saved
  const accepted = (await headers()).get('accept-language') ?? ''
  for (const item of accepted
    .split(',')
    .map((entry, index) => ({
      code: entry.split(';')[0].trim(),
      quality: Number(entry.match(/q=([\d.]+)/)?.[1] ?? 1),
      index,
    }))
    .sort((a, b) => b.quality - a.quality || a.index - b.index)) {
    const language = languageFrom(item.code)
    if (language && item.quality > 0) return language
  }
  return 'pt-BR' as const
}
export async function serverTranslator() {
  const language = await requestLanguage()
  return (source: string | number | null | undefined) =>
    translate(language, source)
}

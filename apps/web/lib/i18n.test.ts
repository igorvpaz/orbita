import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import ts from 'typescript'
import { languageFrom, languages, translate } from './i18n'
import { translations } from './translations'
describe('six supported languages', () => {
  it('recognizes regional browser preferences and rejects unknown locales', () => {
    expect(languageFrom('es-AR')).toBe('es')
    expect(languageFrom('pt-PT')).toBe('pt-BR')
    expect(languageFrom('fr-CA')).toBe('fr')
    expect(languageFrom('unknown')).toBeUndefined()
  })
  it('has five complete translations for each message', () => {
    for (const [key, row] of Object.entries(translations)) {
      expect(row, key).toHaveLength(5)
      expect(
        row.every((v) => typeof v === 'string' && v.trim().length > 0),
        key,
      ).toBe(true)
    }
  })
  it('translates the titles and descriptions of every seeded demo service', () => {
    const seed = readFileSync('../../supabase/seed.sql', 'utf8')
    for (const match of seed.matchAll(
      /select u\.id,p\.id,'([^']*)','([^']*)'/g,
    )) {
      expect(translations[match[1]], match[1]).toHaveLength(5)
      expect(translations[match[2]], match[2]).toHaveLength(5)
    }
  })
  it('translates booking actions in every language while preserving surrounding whitespace', () => {
    for (const l of languages.filter((l) => l !== 'pt-BR')) {
      expect(translate(l, 'Reservar horário')).not.toBe('Reservar horário')
      expect(translate(l, ' Reservar horário ')).toBe(
        ' ' + translate(l, 'Reservar horário') + ' ',
      )
    }
  })
  it('uses a localized fallback for unknown provider errors without changing authored content', () => {
    expect(
      translate('en', 'Detalhe inesperado do provedor', 'Falha na operação'),
    ).toBe(translations['Falha na operação'][0])
    expect(translate('fr', 'Descrição livre do administrador')).toBe(
      'Descrição livre do administrador',
    )
  })
  it('covers every literal message used by the interface', () => {
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory()
          ? walk(dir + '/' + e.name)
          : e.name.endsWith('.tsx')
            ? [dir + '/' + e.name]
            : [],
      )
    const missing = new Set<string>()
    for (const path of [
      ...walk('components'),
      ...walk('app').filter((p) => !p.includes('/api/')),
    ]) {
      const source = ts.createSourceFile(
        path,
        readFileSync(path, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
      )
      const visit = (node: ts.Node) => {
        if (
          ts.isCallExpression(node) &&
          node.expression.getText(source) === 't' &&
          node.arguments[0] &&
          ts.isStringLiteral(node.arguments[0])
        ) {
          const key = node.arguments[0].text.trim()
          if (!translations[key]) missing.add(key)
        }
        ts.forEachChild(node, visit)
      }
      visit(source)
    }
    expect([...missing]).toEqual([])
  })
})

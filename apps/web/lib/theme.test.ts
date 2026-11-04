import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'

describe('tema antes da primeira pintura', () => {
  it.each([
    [null, true, 'dark'],
    [null, false, 'light'],
    ['light', true, 'light'],
    ['dark', false, 'dark'],
    ['invalid', true, 'dark'],
  ])(
    'preferência %s com dispositivo escuro %s resolve %s',
    (saved, dark, expected) => {
      const document = {
        documentElement: { dataset: {} as Record<string, string> },
      }
      runInNewContext(readFileSync('public/theme.js', 'utf8'), {
        document,
        localStorage: { getItem: () => saved },
        matchMedia: () => ({ matches: dark }),
      })
      expect(document.documentElement.dataset.theme).toBe(expected)
    },
  )
  it('segue o dispositivo quando o armazenamento está bloqueado', () => {
    const document = {
      documentElement: { dataset: {} as Record<string, string> },
    }
    runInNewContext(readFileSync('public/theme.js', 'utf8'), {
      document,
      localStorage: {
        getItem: () => {
          throw new Error('blocked')
        },
      },
      matchMedia: () => ({ matches: true }),
    })
    expect(document.documentElement.dataset.theme).toBe('dark')
  })
})

import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'

function worker() {
  const handlers: Record<string, (event: unknown) => void> = {}
  const offline = new Response('Offline only')
  const caches = {
    match: vi.fn(async () => offline),
    keys: vi.fn(async () => ['orbita-old', 'unrelated-cache']),
    delete: vi.fn(async () => true),
    open: vi.fn(async () => ({ addAll: vi.fn() })),
  }
  const fetch = vi.fn(async () => new Response('network'))
  runInNewContext(readFileSync('public/sw.js', 'utf8'), {
    self: {
      location: { origin: 'https://orbita.test' },
      addEventListener: (name: string, fn: (event: unknown) => void) => {
        handlers[name] = fn
      },
      skipWaiting: async () => {},
      clients: { claim: async () => {} },
    },
    caches,
    fetch,
    URL,
    Response,
  })
  return { handlers, caches, fetch, offline }
}
describe('PWA cache isolation', () => {
  it('does not intercept or cache private API responses', () => {
    const w = worker(),
      respondWith = vi.fn()
    w.handlers.fetch({
      request: {
        method: 'GET',
        mode: 'cors',
        url: 'https://orbita.test/api/me',
      },
      respondWith,
    })
    expect(respondWith).not.toHaveBeenCalled()
    expect(w.caches.match).not.toHaveBeenCalled()
  })
  it('loads authenticated navigation from network, without storing it', async () => {
    const w = worker()
    let response: Promise<Response> | undefined
    w.handlers.fetch({
      request: {
        method: 'GET',
        mode: 'navigate',
        url: 'https://orbita.test/member',
      },
      respondWith: (v: Promise<Response>) => {
        response = v
      },
    })
    expect(await (await response!).text()).toBe('network')
    expect(w.caches.open).not.toHaveBeenCalled()
  })
  it('uses only the generic offline page if navigation has no network', async () => {
    const w = worker()
    w.fetch.mockRejectedValue(new Error('offline'))
    let response: Promise<Response> | undefined
    w.handlers.fetch({
      request: {
        method: 'GET',
        mode: 'navigate',
        url: 'https://orbita.test/admin',
      },
      respondWith: (v: Promise<Response>) => {
        response = v
      },
    })
    expect(await response).toBe(w.offline)
    expect(w.caches.match).toHaveBeenCalledWith('/offline.html')
  })
  it('preserves caches belonging to other apps', async () => {
    const w = worker()
    let completion: Promise<unknown> | undefined
    w.handlers.activate({
      waitUntil: (v: Promise<unknown>) => {
        completion = v
      },
    })
    await completion
    expect(w.caches.delete).toHaveBeenCalledWith('orbita-old')
    expect(w.caches.delete).not.toHaveBeenCalledWith('unrelated-cache')
  })
})

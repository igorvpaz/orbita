export function destinationForRole(role: 'admin' | 'member', next?: string) {
  const home = role === 'admin' ? '/admin' : '/member'
  if (
    !next ||
    !next.startsWith('/') ||
    next.startsWith('//') ||
    next.includes('\\')
  )
    return home
  const target = new URL(next, 'https://orbita.invalid')
  return target.pathname === home || target.pathname.startsWith(`${home}/`)
    ? target.pathname + target.search
    : home
}

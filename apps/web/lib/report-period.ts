import { z } from 'zod'
export function reportPeriod(params: URLSearchParams, now = new Date()) {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  const period = params.get('period') ?? params.get('days') ?? '30'
  if (period === 'custom') {
    const from = z.iso.date().parse(params.get('from'))
    const to = z.iso.date().parse(params.get('to'))
    if (from > to || (Date.parse(to) - Date.parse(from)) / 86400000 > 365)
      throw new Error('Período inválido')
    return { from, to }
  }
  const days = period === 'today' ? 1 : period === '7' ? 7 : 30
  const from = new Date(Date.parse(today) - (days - 1) * 86400000)
    .toISOString()
    .slice(0, 10)
  return { from, to: today }
}

import { describe, it, expect } from 'vitest'
import { reportPeriod } from './report-period'
describe('report periods in Brasília time', () => {
  it('keeps the previous calendar day before midnight in Brasília', () => {
    expect(
      reportPeriod(
        new URLSearchParams('period=today'),
        new Date('2026-11-04T01:30:00Z'),
      ),
    ).toEqual({ from: '2026-11-03', to: '2026-11-03' })
  })
  it('includes exactly seven calendar days across a month boundary', () => {
    expect(
      reportPeriod(
        new URLSearchParams('period=7'),
        new Date('2026-11-04T13:00:00Z'),
      ),
    ).toEqual({ from: '2026-10-29', to: '2026-11-04' })
  })
  it('rejects reversed, invalid and excessive custom ranges', () => {
    for (const query of [
      'period=custom&from=2026-11-05&to=2026-11-04',
      'period=custom&from=2026-02-30&to=2026-03-01',
      'period=custom&from=2024-01-01&to=2026-01-01',
    ])
      expect(() => reportPeriod(new URLSearchParams(query))).toThrow()
  })
})

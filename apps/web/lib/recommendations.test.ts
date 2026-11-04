import { describe, expect, it } from 'vitest'
import { localContext, rankServices, type Rule } from './recommendations'

const services = [
  { id: 'a', created_at: '2026-01-01T00:00:00Z' },
  { id: 'b', created_at: '2026-01-02T00:00:00Z' },
  { id: 'c', created_at: '2026-01-03T00:00:00Z' },
]
const rule = (
  service_id: string,
  plan_id: string | null,
  weekdays: number[],
  start_time: string,
  end_time: string,
  priority: number,
): Rule => ({
  service_id,
  plan_id,
  weekdays,
  start_time,
  end_time,
  priority,
  enabled: true,
})

describe('recomendações', () => {
  it('usa o dia e horário da unidade', () => {
    const context = localContext(
      new Date('2026-11-02T12:30:00Z'),
      'America/Sao_Paulo',
    )
    expect(context).toEqual({ weekday: 1, time: '09:30' })
  })
  it('mantém todos os serviços e destaca o horário, sem liberar plano incompatível', () => {
    const rules = [
      rule('a', 'premium', [1], '08:00', '10:00', 10),
      rule('b', 'basic', [1], '08:00', '10:00', 5),
    ]
    expect(
      rankServices(services, rules, 'basic', { weekday: 1, time: '09:30' }).map(
        (item) => item.id,
      ),
    ).toEqual(['b', 'c', 'a'])
    expect(
      rankServices(services, rules, 'basic', { weekday: 1, time: '10:00' }).map(
        (item) => item.id,
      ),
    ).toEqual(['c', 'a', 'b'])
  })
})

describe('catálogo Premium', () => {
  const items = [
    { id: 'basic', created_at: '2026-01-01', access_plan: 'basic' },
    { id: 'premium', created_at: '2026-01-01', access_plan: 'premium' },
  ]
  it('mostra o Premium bloqueado para Básico e permite o Básico disponível', () => {
    const result = rankServices(
      items,
      [],
      'plan-basic',
      { weekday: 1, time: '09:00' },
      'basic',
    )
    expect(result[0]).toMatchObject({
      id: 'premium',
      premium: true,
      locked: true,
      can_order: false,
    })
    expect(result[1]).toMatchObject({
      id: 'basic',
      available_now: true,
      can_order: true,
    })
  })
  it('desbloqueia Premium, mas não permite contratar fora do horário', () => {
    const rules = [rule('premium', null, [1], '08:00', '10:00', 20)]
    const open = rankServices(
      items,
      rules,
      'plan-premium',
      { weekday: 1, time: '08:00' },
      'premium',
    ).find((s) => s.id === 'premium')
    const closed = rankServices(
      items,
      rules,
      'plan-premium',
      { weekday: 1, time: '10:00' },
      'premium',
    ).find((s) => s.id === 'premium')
    expect(open).toMatchObject({
      locked: false,
      available_now: true,
      can_order: true,
    })
    expect(closed).toMatchObject({
      locked: false,
      available_now: false,
      can_order: false,
    })
  })
  it('não oculta serviços de outro dia e ignora regras desabilitadas', () => {
    const result = rankServices(
      items,
      [rule('basic', null, [2], '08:00', '10:00', 5)],
      'plan-basic',
      { weekday: 1, time: '09:00' },
      'basic',
    )
    expect(result).toHaveLength(2)
    expect(result.find((s) => s.id === 'basic')?.available_now).toBe(false)
    expect(
      rankServices(
        items,
        [{ ...rule('basic', null, [2], '08:00', '10:00', 5), enabled: false }],
        'plan-basic',
        { weekday: 1, time: '09:00' },
        'basic',
      ).find((s) => s.id === 'basic')?.available_now,
    ).toBe(true)
  })
})

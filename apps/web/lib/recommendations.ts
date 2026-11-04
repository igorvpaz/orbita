export type Rule = {
  service_id: string
  plan_id: string | null
  weekdays: number[]
  start_time: string
  end_time: string
  priority: number
  enabled: boolean
}

export function localContext(at: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(at)
  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? ''
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
    value('weekday'),
  )
  return { weekday, time: `${value('hour')}:${value('minute')}` }
}

export function rankServices<
  T extends { id: string; created_at: string; access_plan?: string },
>(
  services: T[],
  rules: Rule[],
  planId: string,
  context: { weekday: number; time: string },
  planCode = 'basic',
) {
  return services
    .map((service) => {
      const own = rules.filter(
        (rule) => rule.service_id === service.id && rule.enabled,
      )
      const premium = service.access_plan === 'premium'
      const locked = premium && planCode !== 'premium'
      const matching = own.filter(
        (rule) =>
          rule.weekdays.includes(context.weekday) &&
          context.time >= rule.start_time.slice(0, 5) &&
          context.time < rule.end_time.slice(0, 5) &&
          (locked || rule.plan_id === null || rule.plan_id === planId),
      )
      const available_now = own.length === 0 || matching.length > 0
      return {
        ...service,
        premium,
        locked,
        available_now,
        can_order: available_now && !locked,
        priority: matching.length
          ? Math.max(...matching.map((rule) => rule.priority))
          : -1,
        reason: available_now ? 'Disponível agora' : 'Fora do horário',
        schedules: own.map((rule) => ({
          weekdays: rule.weekdays,
          start: rule.start_time.slice(0, 5),
          end: rule.end_time.slice(0, 5),
        })),
      }
    })
    .sort(
      (a, b) =>
        Number(b.available_now) - Number(a.available_now) ||
        Number(b.premium) - Number(a.premium) ||
        b.priority - a.priority ||
        a.id.localeCompare(b.id),
    )
}

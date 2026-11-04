import { describe, expect, it } from 'vitest'
import { updateServiceSchema } from './service-schema'

describe('edição de serviço', () => {
  it('não apaga regras quando só o status muda', () => {
    const parsed = updateServiceSchema.parse({ status: 'archived' })
    expect(parsed).toEqual({ status: 'archived' })
  })
})

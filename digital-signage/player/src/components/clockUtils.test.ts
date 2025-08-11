import { describe, it, expect } from 'vitest'
import { computeHandAngles, getTimeParts } from './clockUtils'

describe('clock utils', () => {
  it('gets time parts in UTC', () => {
    const d = new Date('2024-01-01T12:34:56.789Z')
    const { hour, minute, second } = getTimeParts(d, 'UTC')
    expect(hour).toBe(12)
    expect(minute).toBe(34)
    expect(second).toBe(56)
  })

  it('computes hand angles with ms fraction', () => {
    const d = new Date('2024-01-01T03:15:30.000Z')
    const { hourDeg, minuteDeg, secondDeg } = computeHandAngles(d, 'UTC', 0.5)
    expect(Math.round(secondDeg)).toBe(183) // ~180 + 3
    expect(Math.round(minuteDeg)).toBe(93) // 15.5/60 * 360
    expect(Math.round(hourDeg)).toBe(98)   // 3.2583/12 * 360
  })
})



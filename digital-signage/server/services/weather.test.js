import { describe, it, expect, vi, beforeEach } from 'vitest'
import weather from './weather.js'

describe('weather service', () => {
  beforeEach(() => {
    weather.__clearCache()
    globalThis.fetch = undefined
  })

  it('fetches and caches weather data', async () => {
    const fake = { main: { temp: 21 }, weather: [{ description: 'clear', icon: '01d' }] }
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => fake }))
    global.fetch = fetchMock
    process.env.OPENWEATHER_API_KEY = 'x'

    const a = await weather.getWeather('London', 'metric')
    const b = await weather.getWeather('London', 'metric')

    expect(a).toEqual(fake)
    expect(b).toEqual(fake)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('propagates API errors with status', async () => {
    const fetchMock = vi.fn(async () => ({ ok: false, status: 404, json: async () => ({ message: 'not found' }) }))
    global.fetch = fetchMock
    process.env.OPENWEATHER_API_KEY = 'x'

    await expect(weather.getWeather('Nowhere', 'metric')).rejects.toHaveProperty('status', 404)
  })
})



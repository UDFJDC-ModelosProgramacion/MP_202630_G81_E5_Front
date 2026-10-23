import { afterEach, describe, expect, it, vi } from 'vitest'

describe('api', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('expone la URL configurada en VITE_API_URL', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:8080/api')

    const { default: API_URL } = await import('./api.js')

    expect(API_URL).toBe('http://localhost:8080/api')
  })
})
import { describe, it, expect } from 'vitest'

describe('Health Check', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should validate health endpoint structure', async () => {
    const { GET } = await import('../app/api/health/route')

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('status', 'ok')
    expect(data).toHaveProperty('timestamp')
    expect(typeof data.timestamp).toBe('string')
  })
})
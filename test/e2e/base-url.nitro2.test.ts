import { describe } from 'vitest'
import { setupFixture } from './helpers'
import { baseUrlTests } from './suites/base-url'

describe('base-url, Nitro v2', async () => {
  // The prefixed fixture, served under /shop/.
  await setupFixture('prefixed', 2, { app: { baseURL: '/shop/' } })
  baseUrlTests(2, '/shop/')
})

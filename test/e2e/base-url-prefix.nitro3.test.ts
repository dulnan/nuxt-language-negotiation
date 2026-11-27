import { describe } from 'vitest'
import { setupFixture } from './helpers'
import { baseUrlTests } from './suites/base-url'

describe('base-url-prefix, Nitro v3', async () => {
  // The prefixed fixture, served under /de/, which is also the prefix of de:
  // the base must be removed once, not twice.
  await setupFixture('prefixed', 3, { app: { baseURL: '/de/' } })
  baseUrlTests(3, '/de/')
})

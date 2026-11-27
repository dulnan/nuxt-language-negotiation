import { describe } from 'vitest'
import { setupFixture } from './helpers'
import { baseUrlTests } from './suites/base-url'

describe('base-url-prefix, Nitro v2', async () => {
  // The prefixed fixture, served under /de/, which is also the prefix of de:
  // the base must be removed once, not twice.
  await setupFixture('prefixed', 2, { app: { baseURL: '/de/' } })
  baseUrlTests(2, '/de/')
})

import { describe } from 'vitest'
import { setupFixture } from './helpers'
import { prefixedTests } from './suites/prefixed'

describe('prefixed, Nitro v3', async () => {
  await setupFixture('prefixed', 3)
  prefixedTests(3)
})

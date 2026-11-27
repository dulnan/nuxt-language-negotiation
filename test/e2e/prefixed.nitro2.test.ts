import { describe } from 'vitest'
import { setupFixture } from './helpers'
import { prefixedTests } from './suites/prefixed'

describe('prefixed, Nitro v2', async () => {
  await setupFixture('prefixed', 2)
  prefixedTests(2)
})

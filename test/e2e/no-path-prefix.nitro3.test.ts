import { describe } from 'vitest'
import { setupFixture } from './helpers'
import { noPathPrefixTests } from './suites/no-path-prefix'

describe('no-path-prefix, Nitro v3', async () => {
  await setupFixture('no-path-prefix', 3)
  noPathPrefixTests(3)
})

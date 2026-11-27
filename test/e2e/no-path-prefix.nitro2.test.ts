import { describe } from 'vitest'
import { setupFixture } from './helpers'
import { noPathPrefixTests } from './suites/no-path-prefix'

describe('no-path-prefix, Nitro v2', async () => {
  await setupFixture('no-path-prefix', 2)
  noPathPrefixTests(2)
})

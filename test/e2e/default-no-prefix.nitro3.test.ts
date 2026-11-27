import { describe } from 'vitest'
import { setupFixture } from './helpers'
import { defaultNoPrefixTests } from './suites/default-no-prefix'

describe('default-no-prefix, Nitro v3', async () => {
  await setupFixture('default-no-prefix', 3)
  defaultNoPrefixTests(3)
})

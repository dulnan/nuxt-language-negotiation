import { describe } from 'vitest'
import { setupFixture } from './helpers'
import { defaultNoPrefixTests } from './suites/default-no-prefix'

describe('default-no-prefix, Nitro v2', async () => {
  await setupFixture('default-no-prefix', 2)
  defaultNoPrefixTests(2)
})

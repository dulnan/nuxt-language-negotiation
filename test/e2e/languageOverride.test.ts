import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

// The module checks PLAYGROUND_DEV to determine whether to import runtime
// server negotiators as .ts (source) or .js (built). Since tests run against
// the source, we need this set before setup() builds the Nuxt app.
process.env.PLAYGROUND_DEV = 'true'

describe('LanguageOverride', async () => {
  await setup({
    rootDir: fileURLToPath(
      new URL('../fixtures/language-override', import.meta.url),
    ),
    dev: true,
  })

  it('renders the route language when no override is present', async () => {
    const html = await $fetch('/en')
    const noOverride = extractTestId(html, 'no-override')
    expect(noOverride).toContain('en')
  })

  it('overrides useCurrentLanguage() to "fr" inside LanguageOverride', async () => {
    const html = await $fetch('/en')
    const overrideFr = extractTestId(html, 'override-fr')
    expect(overrideFr).toContain('fr')
  })

  it('overrides useCurrentLanguage() to "de" inside a different override', async () => {
    const html = await $fetch('/en')
    const overrideDe = extractTestId(html, 'override-de')
    expect(overrideDe).toContain('de')
  })

  it('returns the full language object when using { full: true } with override', async () => {
    const html = await $fetch('/en')
    const code = extractTestId(html, 'language-code')
    const label = extractTestId(html, 'language-label')
    const prefix = extractTestId(html, 'language-prefix')
    expect(code).toContain('de')
    expect(label).toContain('Deutsch')
    expect(prefix).toContain('de')
  })

  it('does not override when langcode is null', async () => {
    const html = await $fetch('/en')
    const overrideNull = extractTestId(html, 'override-null')
    expect(overrideNull).toContain('en')
  })

  it('falls back to default language when langcode is invalid', async () => {
    const html = await $fetch('/en')
    const overrideInvalid = extractTestId(html, 'override-invalid')
    // "xx" is not a valid language, toValidLanguage returns the default ("en")
    expect(overrideInvalid).toContain('en')
  })

  it('works when visiting a non-default language route', async () => {
    const html = await $fetch('/de')
    const noOverride = extractTestId(html, 'no-override')
    const overrideFr = extractTestId(html, 'override-fr')
    // Without override: route language is "de"
    expect(noOverride).toContain('de')
    // With override: still "fr" regardless of route
    expect(overrideFr).toContain('fr')
  })
})

/**
 * Extract the text content of an element with the given data-testid from HTML.
 */
function extractTestId(html: string, testId: string): string {
  const regex = new RegExp(
    `data-testid="${testId}"[^>]*>([\\s\\S]*?)(?=<\\/div>)`,
  )
  const match = regex.exec(html)
  return match?.[1] ?? ''
}

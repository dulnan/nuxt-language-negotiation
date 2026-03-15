import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'

// Required so the module resolves runtime server negotiators as .ts source files.
process.env.PLAYGROUND_DEV = 'true'

describe('SSR', async () => {
  await setup({
    rootDir: fileURLToPath(
      new URL('../fixtures/language-override', import.meta.url),
    ),
    dev: true,
  })

  describe('path prefix negotiation', () => {
    it('detects language from /en prefix', async () => {
      const html = await $fetch<string>('/en')
      expect(extractTestId(html, 'no-override')).toContain('en')
    })

    it('detects language from /de prefix', async () => {
      const html = await $fetch<string>('/de')
      expect(extractTestId(html, 'no-override')).toContain('de')
    })

    it('detects language from /fr prefix', async () => {
      const html = await $fetch<string>('/fr')
      expect(extractTestId(html, 'no-override')).toContain('fr')
    })
  })

  describe('front page redirect', () => {
    it('redirects / to the default language prefix', async () => {
      const response = await fetch('/', { redirect: 'manual' })
      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toMatch(/\/en\/?$/)
    })

    it('preserves query params on redirect', async () => {
      const response = await fetch('/?foo=bar', { redirect: 'manual' })
      expect(response.status).toBe(302)
      expect(response.headers.get('location')).toContain('foo=bar')
    })
  })

  describe('language mapping (translated routes)', () => {
    it('serves the search page at /en/search', async () => {
      const html = await $fetch<string>('/en/search')
      expect(extractTestId(html, 'page-title')).toContain('Search')
      expect(extractTestId(html, 'current-language')).toContain('en')
    })

    it('serves the search page at /de/suchen', async () => {
      const html = await $fetch<string>('/de/suchen')
      expect(extractTestId(html, 'page-title')).toContain('Search')
      expect(extractTestId(html, 'current-language')).toContain('de')
    })

    it('serves the search page at /fr/rechercher', async () => {
      const html = await $fetch<string>('/fr/rechercher')
      expect(extractTestId(html, 'page-title')).toContain('Search')
      expect(extractTestId(html, 'current-language')).toContain('fr')
    })
  })

  describe('language links (SSR)', () => {
    it('renders language links for a mapped page', async () => {
      const html = await $fetch<string>('/en/language-links')
      // All three languages should be present in the rendered HTML.
      expect(html).toContain('lang-link-en')
      expect(html).toContain('lang-link-de')
      expect(html).toContain('lang-link-fr')
    })

    it('marks the active language', async () => {
      const html = await $fetch<string>('/en/language-links')
      const enLink = extractAttribute(html, 'lang-link-en', 'data-active')
      expect(enLink).toBe('true')
    })
  })

  describe('getCurrentLanguage server util', () => {
    it('returns the default language for API requests without negotiation context', async () => {
      const data = await $fetch<{ language: string }>('/api/language')
      expect(data.language).toBe('en')
    })

    it('detects language from query parameter', async () => {
      const data = await $fetch<{ language: string }>(
        '/api/language?lang=de',
      )
      expect(data.language).toBe('de')
    })

    it('detects language from cookie', async () => {
      const data = await $fetch<{ language: string }>('/api/language', {
        headers: { cookie: 'negotiatedLanguage=fr' },
      })
      expect(data.language).toBe('fr')
    })

    it('detects language from Accept-Language header', async () => {
      const data = await $fetch<{ language: string }>('/api/language', {
        headers: { 'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8' },
      })
      expect(data.language).toBe('de')
    })

    it('falls back to default for unknown Accept-Language', async () => {
      const data = await $fetch<{ language: string }>('/api/language', {
        headers: { 'Accept-Language': 'ja-JP,ja;q=0.9' },
      })
      expect(data.language).toBe('en')
    })

    it('respects negotiator order (query wins over cookie)', async () => {
      const data = await $fetch<{ language: string }>(
        '/api/language?lang=fr',
        {
          headers: { cookie: 'negotiatedLanguage=de' },
        },
      )
      expect(data.language).toBe('fr')
    })

    it('respects negotiator order (cookie wins over Accept-Language)', async () => {
      const data = await $fetch<{ language: string }>('/api/language', {
        headers: {
          cookie: 'negotiatedLanguage=fr',
          'Accept-Language': 'de-DE,de;q=0.9',
        },
      })
      expect(data.language).toBe('fr')
    })

    it('ignores invalid language in query and falls through', async () => {
      const data = await $fetch<{ language: string }>(
        '/api/language?lang=xx',
        {
          headers: { 'Accept-Language': 'fr;q=0.9' },
        },
      )
      // "xx" is invalid, query negotiator skips it, Accept-Language matches "fr".
      expect(data.language).toBe('fr')
    })

    it('ignores invalid language in cookie and falls through', async () => {
      const data = await $fetch<{ language: string }>('/api/language', {
        headers: {
          cookie: 'negotiatedLanguage=xx',
          'Accept-Language': 'de;q=0.9',
        },
      })
      expect(data.language).toBe('de')
    })
  })

  describe('definePageLanguageLinks (dynamic routes)', () => {
    it('serves a dynamic page with correct language', async () => {
      const html = await $fetch<string>('/en/dynamic-page')
      expect(extractTestId(html, 'page-title')).toContain('Dynamic Page')
      expect(extractTestId(html, 'current-language')).toContain('en')
    })

    it('serves the same dynamic page in German', async () => {
      const html = await $fetch<string>('/de/dynamische-seite')
      expect(extractTestId(html, 'page-title')).toContain('Dynamic Page')
      expect(extractTestId(html, 'current-language')).toContain('de')
    })
  })
})

function extractTestId(html: string, testId: string): string {
  const regex = new RegExp(
    `data-testid="${testId}"[^>]*>([\\s\\S]*?)(?=<\\/(?:div|span|nav|h1|a))`,
  )
  return regex.exec(html)?.[1] ?? ''
}

function extractAttribute(
  html: string,
  testId: string,
  attr: string,
): string | null {
  const regex = new RegExp(
    `data-testid="${testId}"[^>]*${attr}="([^"]*)"`,
  )
  return regex.exec(html)?.[1] ?? null
}

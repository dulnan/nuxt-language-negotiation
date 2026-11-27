import { describe, it, expect } from 'vitest'
import {
  type NitroMajor,
  getBuiltNitroVersion,
  getJson,
  getState,
  openPage,
  readLinkHref,
  readPageState,
  request,
} from '../helpers'

/**
 * Tests for the "default-no-prefix" fixture: the default language de has no
 * prefix, en and fr do. The negotiators are pathPrefix, query (key language),
 * cookie (name lang) and acceptLanguage.
 */
export function defaultNoPrefixTests(nitro: NitroMajor) {
  it(`is built with Nitro v${nitro}`, async () => {
    expect(await getBuiltNitroVersion()).toMatch(new RegExp(`^${nitro}\\.`))
  })

  describe('front page', () => {
    it('renders / in the default language without a redirect', async () => {
      const response = await request('/', {
        acceptLanguage: 'fr',
        cookie: 'lang=en',
      })
      expect(response.status).toBe(200)
      expect(response.state?.routeName).toBe('index')
      expect(response.state?.language).toBe('de')
    })

    it.each([
      ['/en', 'en'],
      ['/fr', 'fr'],
    ])('renders %s in %s', async (path, language) => {
      expect((await getState(path)).language).toBe(language)
    })
  })

  describe('routes', () => {
    it.each([
      ['/suchen', 'search___de', 'de'],
      ['/en/search', 'search___en', 'en'],
      ['/fr/rechercher', 'search___fr', 'fr'],
      ['/produkte/7', 'products-detail___de', 'de'],
      ['/en/products/7', 'products-detail___en', 'en'],
      ['/produkte/bilder/7', 'products-images___de', 'de'],
      ['/fr/produits/images/7', 'products-images___fr', 'fr'],
      ['/node/5', 'node-id', 'de'],
      ['/en/node/5', 'node-id', 'en'],
      ['/empty-mapping', 'empty-mapping', 'de'],
    ])('renders %s as %s in %s', async (path, routeName, language) => {
      const response = await request(path)
      expect(response.status).toBe(200)
      expect(response.state?.routeName).toBe(routeName)
      expect(response.state?.language).toBe(language)
    })

    it.each([
      // de has no prefix.
      '/de',
      '/de/suchen',
      // The path of another language.
      '/search',
      '/en/suchen',
      // Only the default language.
      '/en/empty-mapping',
    ])('returns 404 for %s', async (path) => {
      expect((await request(path)).status).toBe(404)
    })
  })

  describe('catch-all page', () => {
    it.each([
      ['/seite-1', 'de'],
      ['/en/page-1', 'en'],
    ])('renders %s in %s', async (path, language) => {
      expect((await getState(path)).language).toBe(language)
    })
  })

  describe('error page', () => {
    it.each([
      ['/throws-404', 'de'],
      ['/en/throws-404', 'en'],
      ['/fr/does-not-exist', 'fr'],
    ])('renders %s in %s', async (path, language) => {
      const response = await request(path)
      expect(response.status).toBe(404)
      expect(response.state?.language).toBe(language)
    })
  })

  describe('negotiators after pathPrefix', () => {
    // Intended: without a prefix, a path is in the default language, so
    // pathPrefix returns the default language and the negotiators after it
    // never run. That keeps pages in line with the client, which only reads
    // the path. It also applies to API routes; the server options can handle
    // those, because they run before the negotiators.
    it.each([
      ['the query', '/api/language?language=fr', {}],
      ['the cookie', '/api/language', { cookie: 'lang=fr' }],
      ['Accept-Language', '/api/language', { acceptLanguage: 'fr' }],
    ])('ignores %s on an API route', async (_, path, options) => {
      expect(await getJson(path, options)).toEqual({ language: 'de' })
    })

    it('ignores Accept-Language on a page without a prefix', async () => {
      const state = await getState('/unprefixed-page', { acceptLanguage: 'fr' })
      expect(state.language).toBe('de')
    })
  })

  describe('links by name', () => {
    it.each([
      ['/about', '/about/team'],
      ['/en/about', '/en/about/team'],
    ])('renders %s with a link to the nested page %s', async (path, href) => {
      const response = await request(path)
      expect(response.status).toBe(200)
      expect(readLinkHref(response.body, 'to-team')).toBe(href)
    })
  })

  describe('language links', () => {
    it('links the default language without a prefix', async () => {
      const state = await getState('/suchen')
      expect(state.links.map((v) => [v.code, v.href, v.active])).toEqual([
        ['de', '/suchen', true],
        ['en', '/en/search', false],
        ['fr', '/fr/rechercher', false],
      ])
    })

    it.each(['/en/node/5', '/node/5'])(
      'links every language of a page with a param on %s',
      async (path) => {
        const state = await getState(path)
        expect(state.links.map((v) => [v.code, v.href])).toEqual([
          ['de', '/node/5'],
          ['en', '/en/node/5'],
          ['fr', '/fr/node/5'],
        ])
      },
    )

    it('links the full path of a nested page without a mapping', async () => {
      const state = await getState('/en/about/team')
      expect(state.links.map((v) => [v.code, v.href])).toEqual([
        ['de', '/about/team'],
        ['en', '/en/about/team'],
        ['fr', '/fr/about/team'],
      ])
    })

    it('links the front page of every language', async () => {
      const state = await getState('/en')
      expect(state.links.map((v) => [v.code, v.href, v.active])).toEqual([
        ['de', '/', false],
        ['en', '/en', true],
        ['fr', '/fr', false],
      ])
    })
  })

  describe('browser', () => {
    it('gives a page without a prefix the default language after navigating', async () => {
      const { page } = await openPage('/en')
      await page.getByTestId('to-unprefixed').click()
      await page.waitForURL('**/unprefixed-page')
      await expect
        .poll(async () => (await readPageState(page)).language)
        .toBe('de')
      await page.close()
    })

    it.each([
      ['/', 'de'],
      ['/suchen', 'de'],
      ['/en/products/7', 'en'],
      ['/unprefixed-page', 'de'],
    ])('hydrates %s in %s without errors', async (path, language) => {
      const { page, messages } = await openPage(path, { acceptLanguage: 'fr' })
      expect((await readPageState(page)).language).toBe(language)
      expect(messages).toEqual([])
      await page.close()
    })

    it.each([
      ['/', '/suchen'],
      ['/en', '/en/search'],
    ])('links from %s to the search page at %s', async (path, target) => {
      const { page } = await openPage(path)
      await page.getByTestId('to-search').click()
      await page.waitForURL((url) => url.pathname === target)
      await page.close()
    })

    it('switches from the default language to another one', async () => {
      const { page, messages } = await openPage('/suchen')
      await page.getByTestId('lang-fr').click()
      await page.waitForURL('**/fr/rechercher')
      await expect
        .poll(async () => (await readPageState(page)).language)
        .toBe('fr')
      expect(messages).toEqual([])
      await page.close()
    })
  })
}

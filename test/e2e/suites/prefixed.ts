import { describe, it, expect } from 'vitest'
import {
  type NitroMajor,
  getBuiltNitroVersion,
  getJson,
  getState,
  openPage,
  readFetchLanguages,
  readLinkHref,
  readPageFetchLanguages,
  readPageState,
  readSlowPageLanguage,
  releaseSlowPage,
  waitForSlowPage,
  request,
} from '../helpers'

/**
 * Tests for the "prefixed" fixture: every language has a prefix, the
 * negotiators are pathPrefix, query (keys language, lang), cookie and
 * acceptLanguage, and x-force-language overrides them (server options).
 */
export function prefixedTests(nitro: NitroMajor) {
  it(`is built with Nitro v${nitro}`, async () => {
    expect(await getBuiltNitroVersion()).toMatch(new RegExp(`^${nitro}\\.`))
  })

  describe('front redirect', () => {
    it.each([
      ['nothing', {}, '/de'],
      ['Accept-Language', { acceptLanguage: 'fr' }, '/fr'],
      [
        'Accept-Language by quality',
        { acceptLanguage: 'it;q=1, en;q=0.8, fr;q=0.9' },
        '/fr',
      ],
      ['the cookie', { cookie: 'negotiatedLanguage=en' }, '/en'],
      ['the cookie for gsw_CH', { cookie: 'negotiatedLanguage=gsw_CH' }, '/ch'],
      [
        'the cookie over Accept-Language',
        { cookie: 'negotiatedLanguage=en', acceptLanguage: 'fr' },
        '/en',
      ],
      [
        'Accept-Language for an invalid cookie',
        { cookie: 'negotiatedLanguage=xx', acceptLanguage: 'fr' },
        '/fr',
      ],
      [
        'the server options over everything',
        {
          cookie: 'negotiatedLanguage=en',
          headers: { 'x-force-language': 'fr' },
        },
        '/fr',
      ],
    ])('redirects / by %s', async (_, options, location) => {
      const response = await request('/', options)
      expect(response.status).toBe(302)
      expect(response.location).toBe(location)
    })

    it('redirects / by the query and keeps the query', async () => {
      const response = await request('/?language=fr&x=1', {
        cookie: 'negotiatedLanguage=en',
        acceptLanguage: 'en',
      })
      expect(response.status).toBe(302)
      expect(response.location).toBe('/fr?language=fr&x=1')
    })

    it('redirects / by the second query key', async () => {
      const response = await request('/?lang=en')
      expect(response.location).toBe('/en?lang=en')
    })

    it('keeps the query when redirecting by Accept-Language', async () => {
      const response = await request('/?utm=1', { acceptLanguage: 'fr' })
      expect(response.location).toBe('/fr?utm=1')
    })
  })

  describe('path prefix', () => {
    it('wins over the query, the cookie and Accept-Language', async () => {
      const state = await getState('/fr?language=en', {
        cookie: 'negotiatedLanguage=en',
        acceptLanguage: 'en',
      })
      expect(state.language).toBe('fr')
      expect(state.routeName).toBe('index')
    })

    it('ignores the query string', async () => {
      expect((await getState('/fr?utm=1')).language).toBe('fr')
    })

    it('loses against the server options', async () => {
      const state = await getState('/fr', {
        headers: { 'x-force-language': 'en' },
      })
      expect(state.language).toBe('en')
    })

    it('maps a custom prefix to its language', async () => {
      const state = await getState('/ch')
      expect(state.language).toBe('gsw_CH')
      expect(state.fullLanguage).toEqual({
        code: 'gsw_CH',
        prefix: 'ch',
        label: 'Schwizerdütsch',
      })
    })

    it('returns the full language with { full: true }', async () => {
      expect((await getState('/de')).fullLanguage).toEqual({
        code: 'de',
        prefix: 'de',
        label: 'Deutsch',
      })
    })
  })

  describe('routes', () => {
    it.each([
      ['/de/suchen', 'search___de', 'de'],
      ['/en/search', 'search___en', 'en'],
      ['/fr/rechercher', 'search___fr', 'fr'],
      ['/de/produkte', 'products___de', 'de'],
      ['/ch/produkt', 'products___gsw_CH', 'gsw_CH'],
      ['/en/products/7', 'products-detail___en', 'en'],
      ['/ch/produkt/7', 'products-detail___gsw_CH', 'gsw_CH'],
      ['/de/produkte/bilder/7', 'products-images___de', 'de'],
      ['/fr/produits/images/7', 'products-images___fr', 'fr'],
      ['/en/node/5', 'node-id', 'en'],
      ['/de/empty-mapping', 'empty-mapping', 'de'],
      ['/fr/about/team', 'about-team', 'fr'],
    ])('renders %s as %s in %s', async (path, routeName, language) => {
      const response = await request(path)
      expect(response.status).toBe(200)
      expect(response.state?.routeName).toBe(routeName)
      expect(response.state?.language).toBe(language)
    })

    it.each([
      // No variant for gsw_CH.
      '/ch/search',
      '/ch/suchen',
      '/ch/produkt/images/7',
      // The path of another language.
      '/de/search',
      '/en/suchen',
      // Only the default language.
      '/en/empty-mapping',
      // No such prefix.
      '/xx',
      '/it/search',
    ])('returns 404 for %s', async (path) => {
      expect((await request(path)).status).toBe(404)
    })
  })

  describe('catch-all page', () => {
    it('gets the language from the prefix', async () => {
      const state = await getState('/en/page-1', { acceptLanguage: 'fr' })
      expect(state.routeName).toBe('slug')
      expect(state.language).toBe('en')
    })

    it('falls back to the cookie and Accept-Language without a prefix', async () => {
      expect(
        (await getState('/unprefixed-page', { acceptLanguage: 'fr' })).language,
      ).toBe('fr')
      expect(
        (
          await getState('/unprefixed-page', {
            cookie: 'negotiatedLanguage=en',
            acceptLanguage: 'fr',
          })
        ).language,
      ).toBe('en')
    })
  })

  describe('error page', () => {
    it.each([
      ['/fr/throws-404', 'fr'],
      ['/fr/throws-404?x=1', 'fr'],
      ['/ch/throws-404', 'gsw_CH'],
      ['/en/does-not-exist', 'en'],
      ['/en/does-not-exist?x=1', 'en'],
    ])('renders %s in %s', async (path, language) => {
      const response = await request(path, { acceptLanguage: 'de' })
      expect(response.status).toBe(404)
      expect(response.state?.statusCode).toBe(404)
      expect(response.state?.language).toBe(language)
    })
  })

  describe('API route', () => {
    it.each([
      ['the default language', '/api/language', {}, 'de'],
      ['the query', '/api/language?language=fr', {}, 'fr'],
      ['the second query key', '/api/language?lang=en', {}, 'en'],
      [
        'the first valid query key',
        '/api/language?language=xx&lang=en',
        {},
        'en',
      ],
      [
        'the cookie',
        '/api/language',
        { cookie: 'negotiatedLanguage=en' },
        'en',
      ],
      ['Accept-Language', '/api/language', { acceptLanguage: 'fr' }, 'fr'],
      [
        'the query over the cookie',
        '/api/language?language=fr',
        { cookie: 'negotiatedLanguage=en' },
        'fr',
      ],
      [
        'the server options over the query',
        '/api/language?language=en',
        { headers: { 'x-force-language': 'fr' } },
        'fr',
      ],
      [
        'Accept-Language for a repeated query key',
        '/api/language?language=en&language=fr',
        { acceptLanguage: 'de' },
        'de',
      ],
      [
        'the default language for an invalid server options result',
        '/api/language',
        { headers: { 'x-force-language': 'xx' } },
        'de',
      ],
    ])('negotiates %s', async (_, path, options, language) => {
      expect(await getJson(path, options)).toEqual({ language })
    })
  })

  describe('links by name', () => {
    it.each([
      ['/fr/about', '/fr/about/team'],
      ['/ch/about', '/ch/about/team'],
      ['/de/about/team', '/de/about/team'],
    ])('renders %s with a link to the nested page %s', async (path, href) => {
      const response = await request(path)
      expect(response.status).toBe(200)
      expect(readLinkHref(response.body, 'to-team')).toBe(href)
    })
  })

  describe('language links', () => {
    it('links the mapped variants and disables missing ones', async () => {
      const state = await getState('/de/suchen')
      expect(state.links).toEqual([
        {
          code: 'de',
          enabled: true,
          active: true,
          to: '/de/suchen',
          href: '/de/suchen',
          resolveError: null,
        },
        {
          code: 'en',
          enabled: true,
          active: false,
          to: '/en/search',
          href: '/en/search',
          resolveError: null,
        },
        {
          code: 'fr',
          enabled: true,
          active: false,
          to: '/fr/rechercher',
          href: '/fr/rechercher',
          resolveError: null,
        },
        {
          code: 'gsw_CH',
          enabled: false,
          active: false,
          to: null,
          href: null,
          resolveError: null,
        },
      ])
    })

    it('links every language of a page without a mapping', async () => {
      const state = await getState('/fr')
      expect(state.links.map((v) => [v.code, v.href, v.active])).toEqual([
        ['de', '/de', false],
        ['en', '/en', false],
        ['fr', '/fr', true],
        ['gsw_CH', '/ch', false],
      ])
    })

    it('links the variants of a child page in a mapped parent', async () => {
      const state = await getState('/en/products/7')
      expect(state.links.map((v) => [v.code, v.href])).toEqual([
        ['de', '/de/produkte/7'],
        ['en', '/en/products/7'],
        ['fr', '/fr/produits/7'],
        ['gsw_CH', '/ch/produkt/7'],
      ])
    })

    it('links the pages from definePageLanguageLinks', async () => {
      const state = await getState('/en/page-1')
      expect(state.links.map((v) => [v.code, v.href, v.active])).toEqual([
        ['de', '/de/seite-1', false],
        ['en', '/en/page-1', true],
        ['fr', '/fr/page-1', false],
        ['gsw_CH', null, false],
      ])
    })

    it('links every language of a page with a param', async () => {
      const state = await getState('/en/node/5')
      expect(state.links.map((v) => [v.code, v.href, v.active])).toEqual([
        ['de', '/de/node/5', false],
        ['en', '/en/node/5', true],
        ['fr', '/fr/node/5', false],
        ['gsw_CH', '/ch/node/5', false],
      ])
    })

    it('links the full path of a nested page without a mapping', async () => {
      const state = await getState('/fr/about/team')
      expect(state.links.map((v) => [v.code, v.href])).toEqual([
        ['de', '/de/about/team'],
        ['en', '/en/about/team'],
        ['fr', '/fr/about/team'],
        ['gsw_CH', '/ch/about/team'],
      ])
    })

    it('links the pages set in the state like vuepal does', async () => {
      const state = await getState('/en/cms-page')
      expect(state.links.map((v) => [v.code, v.to, v.active])).toEqual([
        ['de', '/de/cms-seite', false],
        ['en', '/en/cms-page', true],
        ['fr', '/fr/page-cms', false],
        ['gsw_CH', null, false],
      ])
    })

    // Apps render the links as <a :href="link.to">.
    it.each(['/de/suchen', '/fr', '/de/produkte', '/en/page-1'])(
      'links the languages of %s by path',
      async (path) => {
        const state = await getState(path)
        for (const link of state.links.filter((v) => v.enabled)) {
          expect(link.to).toBe(link.href)
        }
      },
    )
  })

  describe('route names', () => {
    // Apps read the language from the route name, and link by
    // meta.originalName.
    it.each([
      ['/fr/rechercher', 'search___fr', 'search'],
      ['/ch/produkt/7', 'products-detail___gsw_CH', 'products-detail'],
      ['/fr', 'index', 'index'],
      ['/fr/node/5', 'node-id', 'node-id'],
    ])('names the route of %s %s', async (path, routeName, originalName) => {
      const state = await getState(path)
      expect(state.routeName).toBe(routeName)
      expect(state.originalName).toBe(originalName)
    })
  })

  describe('links by the current route', () => {
    // Like a pagination: { name: route.name, params: route.params, query }.
    it.each([
      ['/fr/rechercher', '/fr/rechercher?page=2'],
      ['/fr', '/fr?page=2'],
      ['/ch/produkt/7', '/ch/produkt/7?page=2'],
      ['/en/node/5', '/en/node/5?page=2'],
      ['/en/page-1', '/en/page-1?page=2'],
    ])('links %s to %s', async (path, href) => {
      expect((await getState(path)).paginationHref).toBe(href)
    })
  })

  describe('server code', () => {
    it('imports the config', async () => {
      expect(await getJson('/api/config')).toEqual({
        defaultLangcode: 'de',
        langcodes: ['de', 'en', 'fr', 'gsw_CH'],
      })
    })
  })

  describe('data fetching', () => {
    it.each([
      ['/fr/rechercher', {}, 'fr'],
      ['/de/suchen', { headers: { 'x-force-language': 'en' } }, 'en'],
    ])(
      'fetches the data of %s in the page language',
      async (path, options, language) => {
        const response = await request(path, options)
        expect(readFetchLanguages(response.body)).toEqual([language, language])
      },
    )
  })

  describe('browser', () => {
    it.each([
      ['/fr', 'fr'],
      ['/de/suchen', 'de'],
      ['/en/products/7', 'en'],
      ['/ch/produkt/7', 'gsw_CH'],
      ['/en/page-1', 'en'],
      ['/en/node/5', 'en'],
    ])('hydrates %s in %s without errors', async (path, language) => {
      const { page, messages } = await openPage(path, { acceptLanguage: 'de' })
      const state = await readPageState(page)
      expect(state.language).toBe(language)
      expect(messages).toEqual([])
      await page.close()
    })

    it('hydrates the error page without errors', async () => {
      const { page, messages, response } = await openPage('/fr/throws-404')
      expect(response?.status()).toBe(404)
      const state = await readPageState(page)
      expect(state.language).toBe('fr')
      expect(state.statusCode).toBe(404)
      // The browser logs the 404 status of the document itself.
      expect(
        messages.filter(
          (v) =>
            !v.startsWith(
              'Failed to load resource: the server responded with a status of 404',
            ),
        ),
      ).toEqual([])
      await page.close()
    })

    it('links to the page in the current language', async () => {
      const { page } = await openPage('/fr')
      await page.getByTestId('to-search').click()
      await page.waitForURL('**/fr/rechercher')
      expect((await readPageState(page)).language).toBe('fr')
      await page.close()
    })

    it('links to the default language when the page has no variant', async () => {
      const { page } = await openPage('/ch')
      await page.getByTestId('to-search').click()
      await page.waitForURL('**/de/suchen')
      expect((await readPageState(page)).language).toBe('de')
      await page.close()
    })

    it('keeps the params of the current route in links', async () => {
      const { page } = await openPage('/fr/produits/7')
      await page.getByTestId('to-images').click()
      await page.waitForURL('**/fr/produits/images/7')
      await page.close()
    })

    it('switches the language of a page with a param', async () => {
      const { page, messages } = await openPage('/en/node/5')
      await page.getByTestId('lang-de').click()
      await page.waitForURL('**/de/node/5')
      await expect
        .poll(async () => (await readPageState(page)).language)
        .toBe('de')
      expect(messages).toEqual([])
      await page.close()
    })

    it('switches the language with a language link', async () => {
      const { page, messages } = await openPage('/de/suchen')
      await page.getByTestId('lang-en').click()
      await page.waitForURL('**/en/search')
      await expect
        .poll(async () => (await readPageState(page)).language)
        .toBe('en')
      expect(messages).toEqual([])
      await page.close()
    })

    it('hydrates a page without a prefix in the negotiated language', async () => {
      const { page, messages } = await openPage('/unprefixed-page', {
        acceptLanguage: 'fr',
      })
      const state = await readPageState(page)
      expect(messages).toEqual([])
      expect(state.language).toBe('fr')
      await page.close()
    })

    it('hydrates a page in the language of the server options', async () => {
      const { page, messages } = await openPage('/fr', {
        headers: { 'x-force-language': 'en' },
      })
      expect((await readPageState(page)).language).toBe('en')
      expect(messages).toEqual([])
      await page.close()
    })

    it('keeps the language when navigating to a page without a prefix', async () => {
      const { page, messages } = await openPage('/fr', { acceptLanguage: 'de' })
      await page.getByTestId('to-unprefixed').click()
      await page.waitForURL('**/unprefixed-page')
      await expect
        .poll(async () => (await readPageState(page)).routeName)
        .toBe('slug')
      expect((await readPageState(page)).language).toBe('fr')
      expect(messages).toEqual([])
      await page.close()
    })

    it('keeps a language switched on the client for a page without a prefix', async () => {
      const { page } = await openPage('/de/suchen')
      await page.getByTestId('lang-en').click()
      await page.waitForURL('**/en/search')
      await page.getByTestId('to-unprefixed').click()
      await page.waitForURL('**/unprefixed-page')
      await expect
        .poll(async () => (await readPageState(page)).routeName)
        .toBe('slug')
      expect((await readPageState(page)).language).toBe('en')
      await page.close()
    })

    it('takes the language from the prefix after a page without a prefix', async () => {
      const { page } = await openPage('/unprefixed-page', {
        acceptLanguage: 'fr',
      })
      await page.evaluate(() =>
        (window as any).useNuxtApp().$router.push('/en/search'),
      )
      await page.waitForURL('**/en/search')
      await expect
        .poll(async () => (await readPageState(page)).language)
        .toBe('en')
      await page.close()
    })

    it('fetches the data of the next page in its language', async () => {
      const { page, messages } = await openPage('/de/suchen')
      expect(await readPageFetchLanguages(page)).toEqual(['de', 'de'])
      await page.getByTestId('lang-fr').click()
      await page.waitForURL('**/fr/rechercher')
      await expect
        .poll(() => readPageFetchLanguages(page))
        .toEqual(['fr', 'fr'])
      expect(messages).toEqual([])
      await page.close()
    })

    it('changes the language once per language switch', async () => {
      const { page } = await openPage('/de/suchen')
      expect((await readPageState(page)).languageChanges).toEqual([])

      await page.getByTestId('lang-fr').click()
      await page.waitForURL('**/fr/rechercher')
      await expect
        .poll(async () => (await readPageState(page)).languageChanges)
        .toEqual(['fr'])

      // Within the same language.
      await page.evaluate(() =>
        (window as any).useNuxtApp().$router.push('/fr/produits/7'),
      )
      await page.waitForURL('**/fr/produits/7')
      await expect
        .poll(async () => (await readPageState(page)).routePath)
        .toBe('/fr/produits/7')
      expect((await readPageState(page)).languageChanges).toEqual(['fr'])

      await page.getByTestId('lang-en').click()
      await page.waitForURL('**/en/products/7')
      await expect
        .poll(async () => (await readPageState(page)).languageChanges)
        .toEqual(['fr', 'en'])
      await page.close()
    })

    it('keeps the language of a page until the next page is shown', async () => {
      const { page, messages } = await openPage('/de/slow')
      await page.getByTestId('lang-fr').click()
      await page.waitForURL('**/fr/slow')
      await waitForSlowPage(page)

      // While the next page loads, the previous page and everything outside
      // of the page stay in the previous language.
      expect(await readSlowPageLanguage(page)).toBe('de')
      const loading = await readPageState(page)
      expect(loading.language).toBe('de')
      expect(loading.languageChanges).toEqual([])

      await releaseSlowPage(page)
      await expect.poll(() => readSlowPageLanguage(page)).toBe('fr')
      await expect
        .poll(async () => (await readPageState(page)).languageChanges)
        .toEqual(['fr'])
      expect((await readPageState(page)).language).toBe('fr')
      expect(messages).toEqual([])
      await page.close()
    })

    it('resolves a nested page without a mapping by name', async () => {
      const { page } = await openPage('/fr/about/team')
      const href = await page.evaluate(() => {
        try {
          return (window as any)
            .useNuxtApp()
            .$router.resolve({ name: 'about-team' }).href
        } catch (e) {
          return `Error: ${(e as Error).message}`
        }
      })
      expect(href).toBe('/fr/about/team')
      await page.close()
    })
  })
}

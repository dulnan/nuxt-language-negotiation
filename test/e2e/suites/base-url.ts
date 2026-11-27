import { describe, it, expect } from 'vitest'
import {
  type NitroMajor,
  getBuiltNitroVersion,
  getJson,
  getState,
  openPage,
  readPageState,
  request,
} from '../helpers'

/**
 * Tests for the "prefixed" fixture with an app.baseURL, like /shop/.
 */
export function baseUrlTests(nitro: NitroMajor, baseURL: string) {
  // The base without the trailing slash, e.g. /shop.
  const base = baseURL.replace(/\/$/, '')

  it(`is built with Nitro v${nitro}`, async () => {
    expect(await getBuiltNitroVersion()).toMatch(new RegExp(`^${nitro}\\.`))
  })

  describe('front redirect', () => {
    it.each([`${base}/`, base])(
      'redirects %s to the language',
      async (path) => {
        const response = await request(path, { acceptLanguage: 'fr' })
        expect(response.status).toBe(302)
        expect(response.location).toBe(`${base}/fr`)
      },
    )

    it('keeps the query when redirecting', async () => {
      const response = await request(`${base}/?utm=1`, {
        acceptLanguage: 'fr',
      })
      expect(response.location).toBe(`${base}/fr?utm=1`)
    })

    it('redirects by the cookie', async () => {
      const response = await request(`${base}/`, {
        cookie: 'negotiatedLanguage=gsw_CH',
      })
      expect(response.location).toBe(`${base}/ch`)
    })

    it('does not redirect other paths', async () => {
      expect((await request(`${base}/fr`)).status).toBe(200)
    })
  })

  describe('path prefix', () => {
    it.each([
      ['/fr', 'index', 'fr'],
      ['/de', 'index', 'de'],
      ['/fr?x=1', 'index', 'fr'],
      ['/de/suchen', 'search___de', 'de'],
      ['/en/products/7', 'products-detail___en', 'en'],
    ])(
      'renders %s in the language of the prefix',
      async (path, routeName, language) => {
        const state = await getState(base + path, { acceptLanguage: 'it' })
        expect(state.routeName).toBe(routeName)
        expect(state.language).toBe(language)
      },
    )

    it.each([
      ['/fr/throws-404', 'fr'],
      ['/fr/throws-404?x=1', 'fr'],
      ['/en/does-not-exist', 'en'],
    ])('renders the error page %s in %s', async (path, language) => {
      const response = await request(base + path, { acceptLanguage: 'de' })
      expect(response.status).toBe(404)
      expect(response.state?.language).toBe(language)
    })
  })

  describe('API route', () => {
    it.each([
      ['/api/language?language=fr', {}, 'fr'],
      ['/api/language', { acceptLanguage: 'en' }, 'en'],
      ['/api/language', {}, 'de'],
    ])('negotiates %s', async (path, options, language) => {
      expect(await getJson(base + path, options)).toEqual({ language })
    })
  })

  describe('language links', () => {
    it('links the variants with the base URL', async () => {
      const state = await getState(`${base}/de/suchen`)
      expect(state.links.map((v) => [v.code, v.href, v.active])).toEqual([
        ['de', `${base}/de/suchen`, true],
        ['en', `${base}/en/search`, false],
        ['fr', `${base}/fr/rechercher`, false],
        ['gsw_CH', null, false],
      ])
    })
  })

  describe('browser', () => {
    it.each([
      ['/fr', 'fr'],
      ['/de/suchen', 'de'],
      ['/fr/throws-404', 'fr'],
    ])('hydrates %s in %s without errors', async (path, language) => {
      const { page, messages } = await openPage(base + path, {
        acceptLanguage: 'en',
      })
      expect((await readPageState(page)).language).toBe(language)
      // The browser logs the 404 status of the error page itself.
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

    it('switches the language with a language link', async () => {
      const { page } = await openPage(`${base}/de/suchen`)
      await page.getByTestId('lang-fr').click()
      await page.waitForURL((url) => url.pathname === `${base}/fr/rechercher`)
      await expect
        .poll(async () => (await readPageState(page)).language)
        .toBe('fr')
      await page.close()
    })
  })
}

import { describe, it, expect } from 'vitest'
import {
  type NitroMajor,
  getBuiltNitroVersion,
  getJson,
  getState,
  knownIssue,
  openPage,
  readPageState,
  request,
} from '../helpers'

/**
 * Tests for the "prefixed" fixture with app.baseURL /shop/. See #2 in
 * temp/pr-3-follow-ups.md.
 */
export function baseUrlTests(nitro: NitroMajor) {
  // Known issue on Nitro v3 only: event.url.pathname includes the base URL, so
  // the path prefix negotiator reads "shop" as the prefix.
  const onNitro3KnownIssue = nitro === 3 ? knownIssue : it

  it(`is built with Nitro v${nitro}`, async () => {
    expect(await getBuiltNitroVersion()).toMatch(new RegExp(`^${nitro}\\.`))
  })

  describe('front redirect', () => {
    // Known issue: the redirect target leaves out the base URL (Nitro v2), or
    // the middleware never matches (Nitro v3, which returns 404).
    knownIssue('redirects the base URL to the language', async () => {
      const response = await request('/shop/', { acceptLanguage: 'fr' })
      expect(response.status).toBe(302)
      expect(response.location).toBe('/shop/fr')
    })

    knownIssue('keeps the query when redirecting', async () => {
      const response = await request('/shop/?utm=1', { acceptLanguage: 'fr' })
      expect(response.location).toBe('/shop/fr?utm=1')
    })
  })

  describe('path prefix', () => {
    onNitro3KnownIssue('renders the language of the prefix', async () => {
      const state = await getState('/shop/fr', { acceptLanguage: 'en' })
      expect(state.language).toBe('fr')
    })

    onNitro3KnownIssue('renders a mapped route in its language', async () => {
      const state = await getState('/shop/de/suchen', { acceptLanguage: 'en' })
      expect(state.routeName).toBe('search___de')
      expect(state.language).toBe('de')
    })

    onNitro3KnownIssue(
      'renders the error page in the language of the prefix',
      async () => {
        const response = await request('/shop/fr/throws-404', {
          acceptLanguage: 'en',
        })
        expect(response.status).toBe(404)
        expect(response.state?.language).toBe('fr')
      },
    )
  })

  describe('API route', () => {
    it('negotiates by the query', async () => {
      expect(await getJson('/shop/api/language?language=fr')).toEqual({
        language: 'fr',
      })
    })
  })

  describe('language links', () => {
    it('links the variants with the base URL', async () => {
      const state = await getState('/shop/de/suchen')
      expect(state.links.map((v) => [v.code, v.href])).toEqual([
        ['de', '/shop/de/suchen'],
        ['en', '/shop/en/search'],
        ['fr', '/shop/fr/rechercher'],
        ['gsw_CH', null],
      ])
    })
  })

  describe('browser', () => {
    onNitro3KnownIssue('hydrates a page without errors', async () => {
      const { page, messages } = await openPage('/shop/fr', {
        acceptLanguage: 'en',
      })
      expect((await readPageState(page)).language).toBe('fr')
      expect(messages).toEqual([])
      await page.close()
    })
  })
}

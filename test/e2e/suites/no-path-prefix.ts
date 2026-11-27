import { describe, it, expect } from 'vitest'
import {
  type NitroMajor,
  getBuiltNitroVersion,
  getState,
  openPage,
  readPageState,
  request,
} from '../helpers'

/**
 * Tests for the "no-path-prefix" fixture: only the cookie and acceptLanguage
 * negotiators, the routes have no language prefix.
 */
export function noPathPrefixTests(nitro: NitroMajor) {
  it(`is built with Nitro v${nitro}`, async () => {
    expect(await getBuiltNitroVersion()).toMatch(new RegExp(`^${nitro}\\.`))
  })

  describe('server', () => {
    it('does not redirect /', async () => {
      const response = await request('/', { acceptLanguage: 'fr' })
      expect(response.status).toBe(200)
      expect(response.state?.language).toBe('fr')
    })

    it.each([
      ['nothing', {}, 'de'],
      ['Accept-Language', { acceptLanguage: 'fr' }, 'fr'],
      ['the cookie', { cookie: 'negotiatedLanguage=en' }, 'en'],
    ])('negotiates by %s', async (_, options, language) => {
      expect((await getState('/suchen', options)).language).toBe(language)
    })

    it('ignores a path that starts like a prefix', async () => {
      const state = await getState('/en/page-1', { acceptLanguage: 'fr' })
      expect(state.language).toBe('fr')
    })
  })

  describe('browser', () => {
    it.each([
      ['/', { acceptLanguage: 'fr' }, 'fr'],
      ['/suchen', { cookie: 'negotiatedLanguage=en' }, 'en'],
      ['/en/page-1', { acceptLanguage: 'fr' }, 'fr'],
      ['/unprefixed-page', { acceptLanguage: 'fr' }, 'fr'],
    ])(
      'hydrates %s in the negotiated language',
      async (path, options, language) => {
        const { page, messages } = await openPage(path, options)
        expect((await readPageState(page)).language).toBe(language)
        expect(messages).toEqual([])
        await page.close()
      },
    )

    it('keeps the language when navigating', async () => {
      const { page, messages } = await openPage('/', { acceptLanguage: 'fr' })
      await page.getByTestId('to-search').click()
      await page.waitForURL('**/suchen')
      expect((await readPageState(page)).language).toBe('fr')
      expect(messages).toEqual([])
      await page.close()
    })
  })
}

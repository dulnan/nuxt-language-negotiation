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
 * Tests for the "prefixed" fixture, where every language has a prefix.
 */
export function prefixedTests(nitro: NitroMajor) {
  it(`is built with Nitro v${nitro}`, async () => {
    expect(await getBuiltNitroVersion()).toMatch(new RegExp(`^${nitro}\\.`))
  })

  describe('front redirect', () => {
    it('redirects / to the language from Accept-Language', async () => {
      const response = await request('/', { acceptLanguage: 'fr' })
      expect(response.status).toBe(302)
      expect(response.location).toBe('/fr')
    })
  })

  describe('path prefix', () => {
    it('renders the language of the prefix', async () => {
      const state = await getState('/fr', { acceptLanguage: 'en' })
      expect(state.language).toBe('fr')
    })
  })

  describe('browser', () => {
    it('hydrates /fr without errors in the same language', async () => {
      const { page, messages } = await openPage('/fr')
      const state = await readPageState(page)
      expect(state.language).toBe('fr')
      expect(messages).toEqual([])
    })
  })
}

import { describe, it, expect, vi } from 'vitest'
import pathPrefix from '../../src/negotiators/pathPrefix'

vi.mock('@nuxt/kit', async (importOriginal) => {
  const original = await importOriginal<typeof import('@nuxt/kit')>()
  // Needs a Nuxt instance.
  return { ...original, extendPages: vi.fn() }
})

type Language = { code: string; prefix: string; label: string }

function init(languages: Language[]) {
  const helper: any = {
    languages,
    defaultLanguage: languages[0],
    defaultLanguageNoPrefix: languages[0]!.prefix === '',
    addServerNegotiator: vi.fn(),
    addServerMiddleware: vi.fn(),
    addPlugin: vi.fn(),
    addTemplate: vi.fn(),
    nuxt: { options: { experimental: {} } },
  }
  const negotiator = pathPrefix()
  negotiator.init(helper, negotiator.options)
  return helper
}

const de = { code: 'de', prefix: 'de', label: 'Deutsch' }
const fr = { code: 'fr', prefix: 'fr', label: 'Français' }
const en = { code: 'en', prefix: 'en', label: 'English' }

describe('pathPrefix negotiator', () => {
  it('accepts a prefix for every language', () => {
    const helper = init([de, fr, en])
    expect(helper.addServerMiddleware).toHaveBeenCalledWith(
      'frontRedirect',
      '/',
    )
  })

  it('accepts an empty prefix for the default language', () => {
    const helper = init([{ ...de, prefix: '' }, fr, en])
    expect(helper.addServerMiddleware).not.toHaveBeenCalled()
  })

  it('throws if a language other than the default has an empty prefix', () => {
    expect(() => init([de, { ...fr, prefix: '' }, en])).toThrowError(/"fr"/)
  })

  it('names every language other than the default with an empty prefix', () => {
    expect(() =>
      init([de, { ...fr, prefix: '' }, { ...en, prefix: '' }]),
    ).toThrowError(/"fr", "en"/)
  })
})

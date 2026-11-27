import { describe, it, expect } from 'vitest'
import { buildLanguageOptions } from '../../src/build/classes/ModuleHelper'

describe('buildLanguageOptions', () => {
  it('builds the languages from codes', () => {
    expect(buildLanguageOptions(['de', 'en'])).toEqual({
      languages: [
        { code: 'de', prefix: 'de', label: 'Deutsch' },
        { code: 'en', prefix: 'en', label: 'English' },
      ],
      defaultLanguage: { code: 'de', prefix: 'de', label: 'Deutsch' },
      defaultLanguageNoPrefix: false,
    })
  })

  it('keeps a custom prefix and label', () => {
    expect(
      buildLanguageOptions([
        'de',
        { code: 'gsw_CH', prefix: 'ch', label: 'Schwizerdütsch' },
      ]).languages[1],
    ).toEqual({ code: 'gsw_CH', prefix: 'ch', label: 'Schwizerdütsch' })
  })

  it('uses the first language as the default language', () => {
    expect(buildLanguageOptions(['fr', 'de']).defaultLanguage.code).toBe('fr')
  })

  it('has no prefix for the default language with an empty prefix', () => {
    const result = buildLanguageOptions([{ code: 'de', prefix: '' }, 'en'])
    expect(result.defaultLanguageNoPrefix).toBe(true)
    expect(result.defaultLanguage.prefix).toBe('')
  })

  it('throws without languages', () => {
    expect(() => buildLanguageOptions([])).toThrowError(
      'At least one language is required.',
    )
  })

  it('throws for a language without a code', () => {
    expect(() => buildLanguageOptions([{ prefix: 'de' } as any])).toThrowError(
      'Language entry is missing a code.',
    )
  })

  it.each(['es-419', 'de DE', 'de/at', ''])(
    'throws for the invalid code %j',
    (code) => {
      expect(() =>
        buildLanguageOptions([{ code, label: 'Label' }]),
      ).toThrowError(code ? /Invalid language code/ : /missing a code/)
    },
  )

  it.each(['de/at', 'de at', 'de1'])(
    'throws for the invalid prefix %j',
    (prefix) => {
      expect(() => buildLanguageOptions([{ code: 'de', prefix }])).toThrowError(
        /Invalid prefix/,
      )
    },
  )

  it('throws for a code without an ISO 639-1 label', () => {
    expect(() => buildLanguageOptions(['de-DE'])).toThrowError(
      'Failed to determine label for language "de-DE". Please provide a label.',
    )
  })

  it('accepts a code without an ISO 639-1 label when a label is given', () => {
    expect(
      buildLanguageOptions([{ code: 'de-DE', label: 'Deutsch' }]).languages,
    ).toEqual([{ code: 'de-DE', prefix: 'de-DE', label: 'Deutsch' }])
  })

  it('throws for duplicate codes', () => {
    expect(() => buildLanguageOptions(['de', 'en', 'de'])).toThrowError(
      'Duplicate language codes found: de',
    )
  })

  it('throws for duplicate prefixes', () => {
    expect(() =>
      buildLanguageOptions(['de', { code: 'en', prefix: 'de' }]),
    ).toThrowError('Duplicate language prefixes found: de')
  })

  it('throws for two languages without a prefix', () => {
    expect(() =>
      buildLanguageOptions([
        { code: 'de', prefix: '' },
        { code: 'en', prefix: '' },
      ]),
    ).toThrowError(/Duplicate language prefixes found/)
  })
})

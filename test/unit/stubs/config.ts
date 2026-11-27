/**
 * Stand-in for the generated #nuxt-language-negotiation/config, for the
 * languages ['de', 'fr', 'en'].
 */
export type Langcode = 'de' | 'fr' | 'en'

export const langcodes = Object.freeze<Langcode[]>(['de', 'fr', 'en'])
export const languages = Object.freeze([
  { code: 'de', prefix: 'de', label: 'Deutsch' },
  { code: 'fr', prefix: 'fr', label: 'Français' },
  { code: 'en', prefix: 'en', label: 'English' },
])
export const debug = false
export const defaultLanguageNoPrefix = false
export const defaultLangcode: Langcode = 'de'
export const prefixToLangcode = Object.freeze<Record<string, Langcode>>({
  de: 'de',
  fr: 'fr',
  en: 'en',
})
export const langcodeToPrefix = Object.freeze<Record<Langcode, string>>({
  de: 'de',
  fr: 'fr',
  en: 'en',
})
export const baseURL = '/'

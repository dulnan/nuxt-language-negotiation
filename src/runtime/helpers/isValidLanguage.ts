import {
  type ValidLanguage,
  languages,
} from '#nuxt-language-negotiation/config'

export function isValidLanguage(arg: unknown): arg is ValidLanguage {
  return typeof arg === 'string' && languages.includes(arg as any)
}

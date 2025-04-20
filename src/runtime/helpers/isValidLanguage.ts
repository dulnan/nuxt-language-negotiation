import { type Langcode, langcodes } from '#nuxt-language-negotiation/config'

export function isValidLanguage(arg: unknown): arg is Langcode {
  return typeof arg === 'string' && langcodes.includes(arg as any)
}

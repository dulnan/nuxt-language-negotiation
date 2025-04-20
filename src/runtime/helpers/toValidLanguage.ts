import {
  type Langcode,
  langcodes,
  defaultLangcode,
} from '#nuxt-language-negotiation/config'

export function toValidLanguage(language: unknown): Langcode {
  if (typeof language === 'string') {
    if (langcodes.includes(language as any)) {
      return language as Langcode
    }
  }

  return defaultLangcode
}

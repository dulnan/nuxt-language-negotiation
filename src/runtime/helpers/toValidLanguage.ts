import {
  type ValidLanguage,
  languages,
  defaultLanguage,
} from '#nuxt-language-negotiation/config'

export function toValidLanguage(language: unknown): ValidLanguage {
  if (typeof language === 'string') {
    const lowercase = language.toLowerCase()
    if (languages.includes(lowercase as any)) {
      return lowercase as ValidLanguage
    }
  }

  return defaultLanguage
}

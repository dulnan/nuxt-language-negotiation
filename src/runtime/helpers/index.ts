import { prefixToLangcode } from '#nuxt-language-negotiation/config'

/**
 * The useState() key of the current language. The server sets it to the
 * negotiated language, and the payload passes it to the client.
 */
export const LANGUAGE_STATE_KEY = 'nuxt-language-negotiation:language'

export function getLanguageFromPath(path = ''): string | undefined {
  if (!path) {
    return
  }

  const matches = /\/([^/]+)/.exec(path)
  const match = matches?.[1] || ''
  return prefixToLangcode[match]
}

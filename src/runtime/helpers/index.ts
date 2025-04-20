import { prefixToLangcode } from '#nuxt-language-negotiation/config'

export function getLanguageFromPath(path = ''): string | undefined {
  if (!path) {
    return
  }

  const matches = /\/([^/]+)/.exec(path)
  const match = matches?.[1] || ''
  return prefixToLangcode[match]
}

import { addPlugin } from '@nuxt/kit'
import type { H3Event } from 'h3'
import { defineLanguageNegotiator } from '..'
import { LanguageNegotiatorDefinition } from '../../types'

export type LanguageNegotiationPathMapping = Record<string, string>

export type PathPrefixNegotiatorOptions = {
  /**
   * Negotiates the language based on the path prefix.
   *
   * If set to true then it's assumed that the path prefix maps to one of the
   * languages defined in availableLanguages, e.g.:
   * availableLanguages: ['de', 'en']
   *
   * Then '/en/product/123' would resolve to the current language being 'en'.
   *
   * Alternatively you can provide an object that maps the prefix to a language:
   *
   * pathPrefix: {
   *   '/de': 'de',
   *   '/gb': 'en',
   *   '/us': 'en',
   *   '/fr': 'fr',
   * }
   */
  pathPrefix?: boolean | LanguageNegotiationPathMapping
}

export default function pathPrefixNegotiator(
  options?: PathPrefixNegotiatorOptions,
): LanguageNegotiatorDefinition {
  return defineLanguageNegotiator(
    'pathPrefix',
    (context) => {
      const path = context.event.path
      if (!path) {
        return
      }
      const matches = /\/([^/]+)/.exec(path)
      const v = matches?.[1]
      if (v && context.availableLanguages.includes(v)) {
        return v
      }
    },
    ({ resolve }) => {
      addPlugin(resolve('runtime/plugin/language'))
    },
  )
}

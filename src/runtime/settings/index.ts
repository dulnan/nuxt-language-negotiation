import type { NuxtLanguageNegotiationOptions } from '../types'

export const LANGUAGE_CONTEXT_KEY = '__language_context'

export const defaultOptions: Required<NuxtLanguageNegotiationOptions> = {
  availableLanguages: [],
  defaultLanguage: '',
  defaultLanguageNoPrefix: false,
  negotiators: [],
  prefixMapping: {},
  queryStringKeys: ['__language_context'],
  cookieName: '__language_context',
  debug: false,
}

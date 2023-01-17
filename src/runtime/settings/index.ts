import type { NuxtLanguageNegotiationOptions } from '../types'

export const LANGUAGE_CONTEXT_KEY = '__language_context'

export const defaultOptions: Partial<NuxtLanguageNegotiationOptions> = {
  availableLanguages: [],
  negotiators: [],
}

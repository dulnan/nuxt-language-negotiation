import type { InjectionKey, ComputedRef } from 'vue'
import type { Langcode } from '#nuxt-language-negotiation/config'

/**
 * The current override language.
 */
export const INJECT_OVERRIDE_LANGUAGE = Symbol(
  'override_language',
) as InjectionKey<ComputedRef<Langcode | null>>

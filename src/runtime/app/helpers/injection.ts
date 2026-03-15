import type { InjectionKey, ComputedRef } from 'vue'
import type { Router } from 'vue-router'
import type { Langcode } from '#nuxt-language-negotiation/config'

/**
 * The current override language.
 */
export const INJECT_OVERRIDE_LANGUAGE = Symbol(
  'override_language',
) as InjectionKey<ComputedRef<Langcode | null>>

/**
 * Pre-patch router methods, provided by the router plugin.
 *
 * LanguageOverride uses these to call the original resolve/push/replace
 * with its own translateLocation result, avoiding double-translation
 * from the global router patch.
 */
export const INJECT_LANGUAGE_ROUTER_CONTEXT = Symbol(
  'language_router_context',
) as InjectionKey<{
  resolve: Router['resolve']
  push: Router['push']
  replace: Router['replace']
}>

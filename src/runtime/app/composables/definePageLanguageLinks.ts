import { useState, useRoute } from '#imports'
import type { Langcode } from '#nuxt-language-negotiation/config'

/**
 * Define the language links for the current route.
 */
export function definePageLanguageLinks(
  links: Partial<Record<Langcode, string>>,
): void {
  const route = useRoute()
  const stateLinks = useState<
    Record<string, Partial<Record<Langcode, string>>>
  >('pageLanguageLinks', () => {
    return {}
  })

  const existing = stateLinks.value[route.path]
  if (existing) {
    return
  }

  stateLinks.value[route.path] = links
}

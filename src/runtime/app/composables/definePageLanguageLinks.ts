import { useState, useRoute } from '#imports'
import type { Langcode } from '#nuxt-language-negotiation/config'

/**
 * Define the language links for the current route.
 */
export function definePageLanguageLinks(links: Record<Langcode, string>): void {
  const route = useRoute()
  const stateLinks = useState<Record<string, Record<Langcode, string>>>(
    'pageLanguageLinks',
    () => {
      return {}
    },
  )

  const existing = stateLinks.value[route.path]
  if (existing) {
    return
  }

  stateLinks.value[route.path] = links
}

import { getLanguageFromPath } from './../../helpers'
import { toValidLanguage } from './../../helpers/toValidLanguage'
import { useRoute, computed, type ComputedRef, useRequestEvent } from '#imports'
import type { ValidLanguage } from '#nuxt-language-negotiation/config'

/**
 * Return the current language.
 */
export function useCurrentLanguage(): ComputedRef<ValidLanguage> {
  const route = useRoute()

  // On the server, we can use the already negotiated language.
  if (import.meta.server) {
    const event = useRequestEvent()
    if (!event) {
      throw new Error('Failed to get request event.')
    }

    const negotiatedLanguage = event.context.negotiatedLanguage
    if (negotiatedLanguage) {
      return computed(() => negotiatedLanguage)
    }

    throw new Error(
      'The useCurrentLanguage() composable was called before the "nuxt-language-negotiation:server-negotiation" plugin.',
    )
  } else {
    return computed<ValidLanguage>(() => {
      const language = getLanguageFromPath(route.path)
      return toValidLanguage(language)
    })
  }
}

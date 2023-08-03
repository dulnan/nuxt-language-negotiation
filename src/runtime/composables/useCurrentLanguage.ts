import type { H3Event } from 'h3'
import { useSSRContext, getCurrentInstance } from 'vue'
import type { Ref } from 'vue'
import { LANGUAGE_CONTEXT_KEY } from '../settings'
import type { PageLanguage } from '#language-negotiation/language'

/**
 * Return the current language.
 */
export function useCurrentLanguage(providedEvent?: H3Event): Ref<PageLanguage> {
  if (process.server) {
    const getEvent = (): H3Event | undefined => {
      // Event provided by user.
      if (providedEvent) {
        return providedEvent
      }

      if (!getCurrentInstance()) {
        return
      }

      // SSR context should exist at this point, but TS doesn't know that.
      const ssrContext = useSSRContext()
      if (ssrContext) {
        return ssrContext.event
      }
    }
    const event = getEvent()
    if (event) {
      const v = event.context[LANGUAGE_CONTEXT_KEY]
      if (v) {
        return v
      }
    }
  }

  const nuxtApp = useNuxtApp()
  return nuxtApp.$currentLanguage
}

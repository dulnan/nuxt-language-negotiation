import { langcodeToPrefix } from '#nuxt-language-negotiation/config'
import { defineEventHandler, sendRedirect } from 'h3'
import { useRuntimeConfig } from '#imports'
import { withBaseURL } from '../helpers/negotiate'
import { useCurrentLanguage } from '../utils/useCurrentLanguage'

/**
 * Redirects to the correct language prefix for the front route.
 */
export default defineEventHandler(async (event) => {
  // h3 removes the base URL from event.path.
  const [path, query] = event.path.split('?')
  if (path !== '/') {
    return
  }

  // Negotiate the appropriate language.
  const langcode = useCurrentLanguage(event)
  const prefix = langcodeToPrefix[langcode]!
  // The base URL from the runtime config, like Nitro v2 itself.
  const base = useRuntimeConfig(event).app.baseURL
  const target = withBaseURL(prefix, base) + (query ? '?' + query : '')
  await sendRedirect(event, target)
})

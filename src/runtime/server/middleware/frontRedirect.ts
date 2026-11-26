import { langcodeToPrefix } from '#nuxt-language-negotiation/config'
import { defineEventHandler, sendRedirect } from 'h3'
import { useCurrentLanguage } from '../utils/useCurrentLanguage'

/**
 * Redirects to the correct language prefix for the front route.
 */
export default defineEventHandler(async (event) => {
  const [path, query] = event.path.split('?')
  if (path !== '/') {
    return
  }

  // Negotiate the appropriate language.
  const langcode = useCurrentLanguage(event)
  const prefix = langcodeToPrefix[langcode]
  const target = '/' + prefix + (query ? '?' + query : '')
  await sendRedirect(event, target)
})

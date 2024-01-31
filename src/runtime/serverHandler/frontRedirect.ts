import { defineEventHandler, sendRedirect } from 'h3'
import { useRuntimeConfig } from '#imports'

/**
 * Redirect to the correct language prefix of the front page.
 */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)

  const hasDefaultLanguageNoPrefix =
    config.public.languageNegotiation.defaultLanguageNoPrefix

  // Parse the URL to get the pathname
  const baseUrl = 'http://placeholder'
  const url = new URL(event.path, baseUrl)
  const pathname = url.pathname
  const query = url.searchParams

  if (!hasDefaultLanguageNoPrefix && pathname && pathname === '/') {
    const language = config.public.languageNegotiation.defaultLanguage
    if (language) {
      if (query) {
        return sendRedirect(event, '/' + language + '?' + query, 302)
      } else {
        return sendRedirect(event, '/' + language, 302)
      }
    }
  }
})

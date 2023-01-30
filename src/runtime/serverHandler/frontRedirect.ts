import { defineEventHandler, sendRedirect } from 'h3'
import { useCurrentLanguage } from './../composables/useCurrentLanguage'

/**
 * Redirect to the correct language prefix of the front page.
 */
export default defineEventHandler((event) => {
  if (event.path && event.path === '/') {
    const language = useCurrentLanguage(event)
    if (language.value) {
      return sendRedirect(event, '/' + language.value, 302)
    }
  }
})

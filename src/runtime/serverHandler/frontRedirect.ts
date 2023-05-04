import { defineEventHandler, sendRedirect } from 'h3'

/**
 * Redirect to the correct language prefix of the front page.
 */
export default defineEventHandler((event) => {
  if (event.path && event.path === '/') {
    // @TODO
    return sendRedirect(event, '/' + 'de', 302)
  }
})

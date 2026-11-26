import type { H3Event } from 'h3'
import { defineEventHandler, sendRedirect } from 'nuxt/server'
import { langcodeToPrefix } from '#nuxt-language-negotiation/config'
import { useCurrentLanguage } from '../utils/useCurrentLanguage'

/**
 * Redirects to the correct language prefix for the front route.
 *
 * Portable variant of ./frontRedirect.ts, written against nuxt/server.
 */
export default defineEventHandler((event) => {
  if (event.url.pathname !== '/') {
    return
  }

  // Negotiate the appropriate language. The server util is typed against the
  // h3 v1 event.
  const langcode = useCurrentLanguage(event as unknown as H3Event)
  const prefix = langcodeToPrefix[langcode]
  const target = '/' + prefix + event.url.search
  return sendRedirect(event, target)
})

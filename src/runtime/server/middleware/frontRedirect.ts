import { useCurrentLanguage } from '#imports'
import {
  type Langcode,
  langcodeToPrefix,
} from '#nuxt-language-negotiation/config'
import { defineEventHandler, sendRedirect } from 'h3'

/**
 * Redirects to the correct language prefix for the front route.
 */
export default defineEventHandler(async (event) => {
  const [path, query] = event.path.split('?')
  if (path !== '/') {
    return
  }

  // Negotiate the appropriate language.
  // @ts-expect-error vue-tsc thinks this is an import from the app, so the type is wrong.
  const langcode = (await useCurrentLanguage(event)) as Langcode
  const prefix = langcodeToPrefix[langcode]
  const target = '/' + prefix + (query ? '?' + query : '')
  await sendRedirect(event, target)
})

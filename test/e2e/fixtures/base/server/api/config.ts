import { defaultLangcode, langcodes } from '#nuxt-language-negotiation/config'

/**
 * Like the server options of nuxt-graphql-middleware in apps that use the
 * module: server code that imports the config directly.
 */
export default defineEventHandler(() => {
  return { defaultLangcode, langcodes }
})

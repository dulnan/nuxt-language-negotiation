import { defineLanguageNegotiator } from './../defineLanguageNegotiator'

/**
 * Negotiates the language based on a path prefix.
 */
export default defineLanguageNegotiator<{
  defaultLanguageNoPrefix?: boolean
}>('pathPrefix', (helper, options) => {
  helper.addServerNegotiator('pathPrefix', options)
})

import { defineLanguageNegotiator } from './../defineLanguageNegotiator'

export default defineLanguageNegotiator('pathPrefix', (helper, options) => {
  helper.addServerNegotiator('pathPrefix', options)
})

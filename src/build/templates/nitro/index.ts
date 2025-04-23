import { defineTemplate } from '../defineTemplate'

export default defineTemplate(
  {
    name: 'nitro',
    serverTypes: true,
  },
  () => {
    return 'export {}'
  },
  () => {
    return `
import type { Langcode } from '#nuxt-language-negotiation/config'

declare module 'h3' {
  export interface H3EventContext {
    /**
     * The negotiated language.
     */
    negotiatedLanguage?: Langcode
  }
}
`
  },
)

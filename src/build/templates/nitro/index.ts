import { defineTemplate } from '../defineTemplate'

export default defineTemplate(
  {
    name: 'nitro',
    serverOnly: true,
    serverTypes: true,
  },
  () => {
    return 'export {}'
  },
  () => {
    return `
import type { ValidLanguage } from '#nuxt-language-negotiation/config'

declare module 'h3' {
  export interface H3EventContext {
    negotiatedLanguage?: ValidLanguage
  }
}
`
  },
)

import { defineNitroPlugin } from '#imports'
import { serverOptions } from '#nuxt-language-negotiation/server-options'

export default defineNitroPlugin((nitroApp) => {
  console.log('Nitro plugin', nitroApp)
})

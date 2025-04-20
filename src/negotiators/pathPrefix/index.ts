import { PageExtender, type LanguageLinksMap } from './PageExtender'
import { defineLanguageNegotiator } from './../defineLanguageNegotiator'
import { extendPages } from '@nuxt/kit'

/**
 * Negotiates the language based on a path prefix.
 */
export default defineLanguageNegotiator<{
  defaultLanguageNoPrefix?: boolean
}>('pathPrefix', (helper, options) => {
  helper.addServerNegotiator('pathPrefix', options)
  helper.addPlugin('router')

  helper.nuxt.options.experimental.scanPageMeta = true
  helper.nuxt.options.experimental.extraPageMetaExtractionKeys ||= []
  helper.nuxt.options.experimental.extraPageMetaExtractionKeys.push(
    'languageMapping',
  )

  const state: { links: LanguageLinksMap } = {
    links: {},
  }

  helper.addTemplate({
    options: {
      name: 'language-links',
    },
    build() {
      return () => {
        return `export const pageLanguageLinks = ${JSON.stringify(state.links, null, 2)}`
      }
    },
    buildTypes() {
      return `import type { RouteLocationRaw } from 'vue-router'
import type { ValidLanguage } from '#nuxt-language-negotiation/config'

declare module '#nuxt-language-negotiation/language-links' {
  export const pageLanguageLinks: Record<string, Partial<Record<ValidLanguage, RouteLocationRaw>>>
}`
    },
  })

  extendPages((pages) => {
    const extender = new PageExtender(helper)
    const translated = extender.extend(pages)
    state.links = extender.getLanguageLinks()
    pages.length = 0
    pages.push(...translated)
    extender.logMessagesToConsole()
  })
})

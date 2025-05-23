import { PageExtender, type LanguageLinksMap } from './PageExtender'
import { defineLanguageNegotiator } from './../defineLanguageNegotiator'
import { extendPages } from '@nuxt/kit'
import type { NuxtPage } from 'nuxt/schema'

function buildTemplate(links: LanguageLinksMap, routes: NuxtPage[]): string {
  const routeNamesWithoutMapping = routes
    .map((v) => (v.name && !v.name.includes('___') ? v.name : null))
    .filter(Boolean)

  const routeNamesWithLanguageParam = routes
    .map((v) => (v.path.includes(':langPrefix') && v.name ? v.name : null))
    .filter(Boolean)

  return `
export const pageLanguageLinks = Object.freeze(${JSON.stringify(links, null, 2)});
export const routeNamesWithoutMapping = Object.freeze(${JSON.stringify(routeNamesWithoutMapping)});
export const routeNamesWithLanguageParam = Object.freeze(${JSON.stringify(routeNamesWithLanguageParam)});
`
}

/**
 * Negotiates the language based on a path prefix.
 */
export default defineLanguageNegotiator('pathPrefix', (helper) => {
  helper.addServerNegotiator('pathPrefix')
  helper.addPlugin('router')

  // Only do this when all languages have a prefix.
  if (!helper.defaultLanguageNoPrefix) {
    // Handle the redirect already on the server.
    helper.addServerMiddleware('frontRedirect')

    // The plugin is only needs to run on the client.
    helper.addPlugin('frontRedirect', 'client')
  }

  // This allows us to access the languageMapping meta property inside
  // extendPages().
  helper.nuxt.options.experimental.scanPageMeta = true
  helper.nuxt.options.experimental.extraPageMetaExtractionKeys ||= []
  helper.nuxt.options.experimental.extraPageMetaExtractionKeys.push(
    'languageMapping',
  )

  const state: { template: string } = {
    template: '',
  }

  helper.addTemplate({
    options: {
      name: 'routes',
    },
    build() {
      return () => state.template.trim()
    },
    buildTypes() {
      return `import type { RouteLocationRaw } from 'vue-router'
import type { Langcode } from '#nuxt-language-negotiation/config'

declare module '#nuxt-language-negotiation/routes' {
  /**
   * The page language links determined at build time.
   */
  export const pageLanguageLinks: Readonly<Record<string, Partial<Record<Langcode, RouteLocationRaw>>>>;

  /**
   * Names of routes that have a "catch all" language param.
   */
  export const routeNamesWithLanguageParam: Readonly<string[]>;

  /**
   * Names of routes that do not have language mapping.
   */
  export const routeNamesWithoutMapping: Readonly<string[]>;
}`
    },
  })

  extendPages((pages) => {
    const extender = new PageExtender(helper)
    const translated = extender.extend(pages)
    if (extender.hasError() && !helper.isDev) {
      throw new Error('Failed to translate pages.')
    }
    state.template = buildTemplate(extender.getLanguageLinks(), translated)
    pages.length = 0
    pages.push(...translated)
    extender.logMessagesToConsole()
  })
})

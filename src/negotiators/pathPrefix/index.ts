import { PageExtender, type LanguageLinksMap } from './PageExtender'
import { defineLanguageNegotiator } from './../defineLanguageNegotiator'
import { extendPages } from '@nuxt/kit'
import type { NuxtPage } from 'nuxt/schema'
import type { RoutesTemplateData } from '../../build/templates/routes/index'

/**
 * All routes, including the children.
 */
function flattenRoutes(routes: NuxtPage[]): NuxtPage[] {
  return routes.flatMap((v) => [v, ...flattenRoutes(v.children || [])])
}

function buildRoutes(
  links: LanguageLinksMap,
  routes: NuxtPage[],
): RoutesTemplateData {
  // The router plugin needs these for child routes too.
  const allRoutes = flattenRoutes(routes)

  return {
    pageLanguageLinks: links,
    routeNamesWithoutMapping: allRoutes
      .map((v) => (v.name && !v.name.includes('___') ? v.name : null))
      .filter((v) => v !== null),
    routeNamesWithLanguageParam: allRoutes
      .map((v) => (v.path.includes(':langPrefix') && v.name ? v.name : null))
      .filter((v) => v !== null),
  }
}

/**
 * Negotiates the language based on a path prefix.
 */
export default defineLanguageNegotiator('pathPrefix', (helper) => {
  // Only the default language can be without a prefix: the routes and the
  // front redirect rely on it.
  const withoutPrefix = helper.languages
    .filter((v) => v.prefix === '' && v.code !== helper.defaultLanguage.code)
    .map((v) => `"${v.code}"`)
  if (withoutPrefix.length) {
    throw new Error(
      `The pathPrefix negotiator needs a prefix for every language except the default language "${helper.defaultLanguage.code}". Languages without a prefix: ${withoutPrefix.join(', ')}.`,
    )
  }

  helper.addServerNegotiator('pathPrefix')
  helper.addPlugin('router')

  // Only do this when all languages have a prefix.
  if (!helper.defaultLanguageNoPrefix) {
    // Handle the redirect already on the server. Nitro v2 runs middleware with
    // the route "/" for every path, Nitro v3 only for "/".
    helper.addServerMiddleware('frontRedirect', '/')

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

  extendPages((pages) => {
    const extender = new PageExtender(helper)
    const translated = extender.extend(pages)
    if (extender.hasError() && !helper.isDev) {
      throw new Error('Failed to translate pages.')
    }
    helper.routes = buildRoutes(extender.getLanguageLinks(), translated)
    pages.length = 0
    pages.push(...translated)
    extender.logMessagesToConsole()
  })
})

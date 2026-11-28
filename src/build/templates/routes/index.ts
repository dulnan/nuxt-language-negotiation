import { defineTemplate } from '../defineTemplate'

/**
 * A language link built at build time: a path, or a route name for a path
 * with params.
 */
export type BuildLanguageLink =
  string | { name: string; params?: Record<string, string> }

export type RoutesTemplateData = {
  pageLanguageLinks: Record<string, Record<string, BuildLanguageLink>>
  routeNamesWithoutMapping: string[]
  routeNamesWithLanguageParam: string[]
}

/**
 * Always generated, so that useLanguageLinks() also works without the
 * pathPrefix negotiator. The pathPrefix negotiator sets the data.
 */
export default defineTemplate(
  {
    name: 'routes',
  },
  (helper) => () => {
    const routes = helper.routes
    return `
export const pageLanguageLinks = Object.freeze(${JSON.stringify(routes.pageLanguageLinks, null, 2)});
export const routeNamesWithoutMapping = Object.freeze(${JSON.stringify(routes.routeNamesWithoutMapping)});
export const routeNamesWithLanguageParam = Object.freeze(${JSON.stringify(routes.routeNamesWithLanguageParam)});
`.trim()
  },
  () => {
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
)

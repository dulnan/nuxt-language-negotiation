import type { RouteLocationRaw } from 'vue-router'
import {
  routeNamesWithLanguageParam,
  routeNamesWithoutMapping,
  pageLanguageLinks,
} from '#nuxt-language-negotiation/routes'
import {
  type Langcode,
  defaultLangcode,
  langcodeToPrefix,
} from '#nuxt-language-negotiation/config'

/**
 * Translate a route location to the correct language variant.
 *
 * Given a route location (e.g. { name: 'search' }) and a target langcode,
 * returns a new location with the language-specific route name and langPrefix.
 */
export function translateLocation(
  v: RouteLocationRaw,
  langcode: string,
): RouteLocationRaw {
  if (typeof v === 'object') {
    if ('name' in v && v.name) {
      let name = v.name?.toString() || ''
      const params = { ...(v.params || {}) }
      const lang = langcode as Langcode
      if (routeNamesWithLanguageParam.includes(name) && !params.langPrefix) {
        params.langPrefix = langcodeToPrefix[lang]
      }
      if (
        name &&
        !name.includes('___') &&
        !routeNamesWithoutMapping.includes(name)
      ) {
        const links = pageLanguageLinks[name]
        if (links) {
          const hasLinkInLanguage = links[lang]
          if (hasLinkInLanguage) {
            name = name + '___' + lang
          } else {
            name = name + '___' + defaultLangcode
          }
        }
      }
      return {
        ...v,
        name,
        params,
      } as any
    }
  }

  return v
}

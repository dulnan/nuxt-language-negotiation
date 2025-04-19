import {
  languages,
  defaultLanguageNoPrefix,
  defaultLanguage,
} from '#nuxt-language-negotiation/config'
import type { RouterConfig } from '@nuxt/schema'
import type { RouteRecordRaw } from 'vue-router'

function translateRouteRecord(v: RouteRecordRaw): RouteRecordRaw[] {
  return languages.map((language) => {
    const name = v.name?.toString() || ''
    const mapping = v.meta?.languageMapping || {}
    let path = mapping[language] || `/${language}${v.path}`
    if (
      !mapping[language] &&
      defaultLanguageNoPrefix &&
      language === defaultLanguage
    ) {
      path = v.path
    }

    const translated = {
      ...v,
      name: name + '___' + language,
      path: path.replace(/\/$/, ''),
    }

    if (translated.children) {
      // Also translate the child routes.
      translated.children = translated.children.map((child) => {
        const childName = child.name?.toString() || ''
        return {
          ...child,
          name: childName + '___' + language,
        }
      })
    }
    return translated
  })
}

export default {
  routes: (routes) => {
    return routes.flatMap((route) => translateRouteRecord(route))
  },
} satisfies RouterConfig

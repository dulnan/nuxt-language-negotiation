import { defineTemplate } from '../defineTemplate'
import { relative } from 'pathe'

export default defineTemplate(
  {
    name: 'global',
  },
  () => {
    return 'export {}'
  },
  (helper) => {
    const nuxtDist = helper.resolvers.workspace.resolve(
      './node_modules/nuxt/dist/pages/runtime/composables',
    )
    const relativePath = relative(helper.paths.moduleBuildDir, nuxtDist)

    return `
import type { ValidMappingLangcode, Langcode } from '#nuxt-language-negotiation/config'

interface LanguageNegotiationPageMeta {
  languageMapping?: Partial<Record<ValidMappingLangcode, string>>
  originalName?: string
}

declare module '#app' {
  interface PageMeta extends LanguageNegotiationPageMeta {}
}

declare module "${relativePath}" {
  interface PageMeta extends LanguageNegotiationPageMeta {}
}

declare module 'vue-router' {
  interface RouteLocationNamedRaw {
    /**
     * The language code.
     */
    language?: Langcode
  }

  interface RouteLocationPathRaw {
    /**
     * The language code.
     */
    language?: Langcode
  }

  interface RouteMeta extends LanguageNegotiationPageMeta {}
}
`
  },
)

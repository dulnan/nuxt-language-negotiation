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
    const nuxtDist = helper.resolvers.root.resolve(
      './node_modules/nuxt/dist/pages/runtime/composables',
    )
    const relativePath = relative(helper.paths.moduleBuildDir, nuxtDist)

    return `
import type { ValidMappingLangcode, Langcode } from '#nuxt-language-negotiation/config'

interface LanguageNegotiationPageMeta {
  /**
   * Define language mapping for this route.
   *
   * The route's "path" is automatically used as the path for the default
   * language, so the language mapping can only contain paths for non-default
   * languages.
   *
   * The provided path must not contain the prefix for the language itself or
   * the prefix of any existing language.
   */
  languageMapping?: Partial<Record<ValidMappingLangcode, string>>

  /**
   * The original name of the route before translating.
   */
   originalName?: string
}

declare module '#app' {
  interface PageMeta extends LanguageNegotiationPageMeta {}
}

declare module "${relativePath}" {
  interface PageMeta extends LanguageNegotiationPageMeta {}
}

declare module 'vue-router' {
  interface RouteMeta extends LanguageNegotiationPageMeta {}
}
`
  },
)

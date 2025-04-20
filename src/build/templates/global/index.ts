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
import type { ValidMappingLanguage } from '#nuxt-language-negotiation/config'

declare module '#app' {
  interface PageMeta {
    languageMapping?: Partial<Record<ValidMappingLanguage, string>>
    originalName?: string
  }
}

declare module "${relativePath}" {
  interface PageMeta {
    languageMapping?: Partial<Record<ValidMappingLanguage, string>>
  }
}

declare module 'vue-router' {
  interface RouteLocationNamedRaw {
    /**
     * The language code.
     */
    language?: ValidLanguage
  }

  interface RouteLocationPathRaw {
    /**
     * The language code.
     */
    language?: ValidLanguage
  }

  interface RouteMeta {
    languageMapping?: Partial<Record<ValidMappingLanguage, string>>
    originalName: string
  }
}
`
  },
)

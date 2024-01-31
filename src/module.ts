import { fileURLToPath } from 'url'
import { defu } from 'defu'
import {
  createResolver,
  defineNuxtModule,
  addServerHandler,
  addTemplate,
  addImports,
  resolveAlias,
  addPlugin,
  extendPages,
} from '@nuxt/kit'
import type {
  BuiltInNegotiators,
  LanguageNegotiatorPublicConfig,
  Negotiators,
  NuxtLanguageNegotiationOptions,
} from './runtime/types'
import { defaultOptions } from './runtime/settings'

const isBuiltInNegotiator = (v: Negotiators): v is BuiltInNegotiators => {
  return (
    v === 'pathPrefix' ||
    v === 'acceptLanguage' ||
    v === 'queryString' ||
    v === 'cookie'
  )
}

// Nuxt needs this.
export type ModuleOptions = NuxtLanguageNegotiationOptions
export type ModuleHooks = {}

export default defineNuxtModule({
  meta: {
    name: 'nuxt-language-negotiation',
    configKey: 'languageNegotiation',
    version: '1.0.0',
    compatibility: {
      nuxt: '^3.7.0',
    },
  },
  defaults: defaultOptions as any,
  setup(passedOptions, nuxt) {
    const options = defu(
      {},
      passedOptions,
      {},
    ) as Required<NuxtLanguageNegotiationOptions>
    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

    const publicConfig: LanguageNegotiatorPublicConfig = {
      availableLanguages: options.availableLanguages as any[],
      queryStringKeys: (options.queryStringKeys || []) as string[],
      debug: !!options.debug as boolean,
      prefixMapping: options.prefixMapping || {},
      cookieName: options.cookieName,
      defaultLanguageNoPrefix: !!options.defaultLanguageNoPrefix,
      negotiators: {},
      defaultLanguage: (options.defaultLanguage ||
        options.availableLanguages[0]) as any,
    }

    nuxt.options.build.transpile.push(runtimeDir)

    // Register negotiators.
    options.negotiators.forEach((entry) => {
      // Add built-in negotiators.
      if (isBuiltInNegotiator(entry)) {
        publicConfig.negotiators[entry] = true
        addServerHandler({
          handler: resolve('./runtime/negotiator/' + entry),
          middleware: true,
        })
      } else {
        // Add user provided negotiators.
        const filePath = resolveAlias(entry)
        addServerHandler({
          handler: resolve(filePath),
          middleware: true,
        })
      }
    })

    // @ts-ignore: TODO: How to fix?
    nuxt.options.runtimeConfig.public.languageNegotiation =
      publicConfig as LanguageNegotiatorPublicConfig

    // Add the server handler that sets the reactive language context on the H3
    // request event.
    addServerHandler({
      handler: resolve('./runtime/serverHandler/languageContext'),
      middleware: true,
    })

    // Add the server handler that redirects to the front page with the correct language prefix.
    addServerHandler({
      handler: resolve('./runtime/serverHandler/frontRedirect'),
      middleware: true,
    })

    // Import composables.
    addImports({
      from: resolve('./runtime/composables/useCurrentLanguage'),
      name: 'useCurrentLanguage',
    })
    addImports({
      from: resolve('./runtime/composables/useLanguageLinks'),
      name: 'useLanguageLinks',
    })
    addImports({
      from: resolve('./runtime/composables/definePageLanguageLinks'),
      name: 'definePageLanguageLinks',
    })

    // Add the Nuxt plugin.
    addPlugin(resolve('./runtime/plugins/language'), { append: false })

    // Add alias to make it easy to import the defineLanguageNegotiator helper.
    nuxt.options.alias['#language-negotiation/negotiator'] = resolve(
      'runtime/defineLanguageNegotiator',
    )

    extendPages((pages) => {
      pages.forEach((page) => {
        if (page.name && page.name.startsWith('language-')) {
          page.name = page.name.replace('language-', '')
        }
      })
    })

    // Create the type definition for the available languages.
    const template = addTemplate({
      write: true,
      filename: 'nuxt-language-negotiation.ts',
      getContents: () => {
        const languages = options.availableLanguages
          .map((lang) => {
            return `'${lang}'`
          })
          .join(' | ')
        return `
        export type PageLanguage = ${languages}
        const VALID_LANGUAGES: PageLanguage[] = ${JSON.stringify(
          options.availableLanguages,
        )}

        export function isValidLanguage(language: string): language is PageLanguage {
          return VALID_LANGUAGES.includes(language as any)
        }
        `
      },
    })
    nuxt.options.alias['#language-negotiation/language'] = template.dst

    // Create the type extensions file.
    const typesPath = addTemplate({
      write: true,
      filename: 'nuxt-language-negotiation-global.d.ts',
      getContents: () => {
        return `import type { PageLanguage } from '#language-negotiation/language'
declare module '#app' {
  interface PageMeta {
    languageMapping?: Partial<Record<PageLanguage, string>>
  }
}
declare module 'vue-router' {
  interface RouteLocationNamedRaw {
    /**
     * The language code.
     */
    language?: PageLanguage
  }

  interface RouteLocationPathRaw {
    /**
     * The language code.
     */
    language?: PageLanguage
  }
}
`
      },
    }).dst

    nuxt.hook('prepare:types', (options) => {
      options.references.push({ path: typesPath })
    })

    // @TODO: Why is this needed?!
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.externals = defu(
        typeof nitroConfig.externals === 'object' ? nitroConfig.externals : {},
        {
          inline: [resolve('./runtime')],
        },
      )
    })
  },
})

import { fileURLToPath } from 'url'
import type { NuxtModule } from '@nuxt/schema'
import { defu } from 'defu'
import {
  createResolver,
  defineNuxtModule,
  addServerHandler,
  addTemplate,
  addImports,
} from '@nuxt/kit'
import { NuxtLanguageNegotiationOptions } from './runtime/types'
import { defaultOptions } from './runtime/settings'

// Nuxt needs this.
export type ModuleOptions = NuxtLanguageNegotiationOptions
export type ModuleHooks = {}

export default defineNuxtModule({
  meta: {
    name: 'nuxt-language-negotiation',
    configKey: 'languageNegotiation',
    version: '1.0.0',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  defaults: defaultOptions as any,
  setup(passedOptions, nuxt) {
    const options = defu({}, passedOptions, {}) as ModuleOptions
    const { resolve } = createResolver(import.meta.url)
    const rootDir = nuxt.options.rootDir
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

    nuxt.options.build.transpile.push(runtimeDir)

    nuxt.options.runtimeConfig.languageNegotiation = {
      rootDir,
    }
    nuxt.options.runtimeConfig.public.languageNegotiation = {
      availableLanguages: options.availableLanguages as string[],
    }

    options.negotiators.forEach((negotiator) => {
      if (negotiator.setup) {
        negotiator.setup({ resolve })
      }
    })

    addServerHandler({
      handler: resolve('./runtime/serverHandler/languageContext'),
      middleware: true,
    })
    addImports({
      from: resolve('./runtime/composables/useCurrentLanguage'),
      name: 'useCurrentLanguage',
    })
    addImports({
      from: resolve('./runtime/composables/useLanguageLinks'),
      name: 'useLanguageLinks',
    })

    const template = addTemplate({
      write: true,
      filename: 'nuxt-language-negotiation.d.ts',
      getContents: () => {
        const languages = options.availableLanguages
          .map((lang) => {
            return `'${lang}'`
          })
          .join(' | ')
        return `export type PageLanguage = ${languages}`
      },
    })
    nuxt.options.alias['#language-negotiation'] = template.dst

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

declare module '#app' {
  interface PageMeta {
    language?: string
  }
}

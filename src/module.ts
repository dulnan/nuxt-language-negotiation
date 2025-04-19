import { fileURLToPath } from 'url'
import { defineNuxtModule, extendPages, addServerPlugin } from '@nuxt/kit'
import type { ModuleOptions } from './build/types'
import { defaultOptions } from './build/helpers'
import { ModuleHelper } from './build/classes/ModuleHelper'
import { TEMPLATES } from './build/templates'

export type { ModuleOptions }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-language-negotiation',
    configKey: 'languageNegotiation',
    version: '2.0.0',
    compatibility: {
      nuxt: '^3.16.0',
    },
  },
  defaults: defaultOptions,
  setup(passedOptions, nuxt) {
    const helper = new ModuleHelper(nuxt, import.meta.url, passedOptions)

    helper.transpile(fileURLToPath(new URL('./runtime', import.meta.url)))

    helper.addComposable('useCurrentLanguage')
    helper.addComposable('useLanguageLinks')
    helper.addComposable('definePageLanguageLinks')
    helper.addPlugin('language')

    helper.addServerUtil('useCurrentLanguage')

    helper.addAlias('#nuxt-language-negotiation', helper.paths.moduleBuildDir)

    addServerPlugin(
      helper.resolvers.module.resolve(
        './runtime/server/plugins/languageNegotiation',
      ),
    )

    const negotiators = passedOptions.negotiators
    negotiators.forEach((negotiator) => {
      negotiator.init(helper, negotiator.options)
    })

    TEMPLATES.forEach((template) => {
      helper.addTemplate(template)
    })

    extendPages((pages) => {
      pages.forEach((page) => {
        if (page.name && page.name.startsWith('language-')) {
          page.name = page.name.replace('language-', '')
        }
      })
    })

    helper.applyBuildConfig()
  },
})

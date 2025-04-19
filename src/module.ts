import { fileURLToPath } from 'url'
import { defineNuxtModule, extendPages } from '@nuxt/kit'
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
    helper.addPlugin('serverNegotiation')
    helper.addPlugin('router')

    helper.addServerUtil('useCurrentLanguage')

    helper.addAlias('#nuxt-language-negotiation', helper.paths.moduleBuildDir)

    const negotiators = passedOptions.negotiators
    negotiators.forEach((negotiator) => {
      negotiator.init(helper, negotiator.options)
    })

    TEMPLATES.forEach((template) => {
      helper.addTemplate(template)
    })

    const routerOptions = helper.resolvers.module.resolve(
      './runtime/app/router.options',
    )

    nuxt.hooks.hook('pages:routerOptions', (ctx) => {
      ctx.files.push({
        path: routerOptions,
      })
    })

    extendPages((pages) => {
      pages.forEach((page) => {
        console.log(page)
      })
    })

    helper.applyBuildConfig()
  },
})

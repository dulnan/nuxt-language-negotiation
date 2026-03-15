import { fileURLToPath } from 'url'
import { name, version } from '../package.json'
import { defineNuxtModule } from '@nuxt/kit'
import type { ModuleOptions } from './build/types'
import { ModuleHelper } from './build/classes/ModuleHelper'
import { TEMPLATES } from './build/templates'

export type { ModuleOptions }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    configKey: 'languageNegotiation',
    version,
    compatibility: {
      nuxt: '>=3.17.0',
    },
  },
  setup(passedOptions, nuxt) {
    const helper = new ModuleHelper(nuxt, import.meta.url, passedOptions)

    helper.transpile(fileURLToPath(new URL('./runtime', import.meta.url)))
    helper.addComposable('useCurrentLanguage')
    helper.addComposable('useLanguageLinks')
    helper.addComposable('definePageLanguageLinks')
    helper.addServerUtil('getCurrentLanguage')
    helper.addComponent('LanguageOverride')
    helper.addAlias('#nuxt-language-negotiation', helper.paths.moduleBuildDir)

    const negotiators = passedOptions.negotiators
    negotiators.forEach((negotiator) => {
      negotiator.init(helper, negotiator.options)
    })

    TEMPLATES.forEach((template) => {
      helper.addTemplate(template)
    })

    helper.applyBuildConfig()
  },
})

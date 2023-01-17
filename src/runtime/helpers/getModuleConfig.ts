import { loadNuxtConfig } from '@nuxt/kit'
import type { NuxtLanguageNegotiationOptions } from './../types'
import { useRuntimeConfig } from '#imports'

let moduleConfig: NuxtLanguageNegotiationOptions | null = null

/**
 * Due to nuxt's architecture, we have to manually load the runtime configuration.
 * This is only done for the first time and we cache the config locally.
 */
export function getModuleConfig(): Promise<NuxtLanguageNegotiationOptions> {
  // Already loaded, return it.
  if (moduleConfig) {
    return Promise.resolve(moduleConfig)
  }

  // Load the configuration.
  const { languageNegotiation } = useRuntimeConfig()
  return loadNuxtConfig({
    cwd: languageNegotiation.rootDir,
  }).then((v: any) => {
    moduleConfig = v.languageNegotiation
    return v.languageNegotiation
  })
}

import type { ServerOptions } from './runtime/types/index'
import type { ValidLanguage } from '#nuxt-language-negotiation/config'

export function defineLanguageServerOptions(
  options: ServerOptions<ValidLanguage>,
): ServerOptions<ValidLanguage> {
  return options
}

import type { ServerOptions } from './runtime/types/index'
import type { Langcode } from '#nuxt-language-negotiation/config'

export function defineLanguageServerOptions(
  options: ServerOptions<Langcode>,
): ServerOptions<Langcode> {
  return options
}

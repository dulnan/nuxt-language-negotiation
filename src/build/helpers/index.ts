import { existsSync } from 'node:fs'
import { useLogger } from '@nuxt/kit'
import type { ConsolaInstance } from 'consola'
import type { ModuleOptions } from '../types'

export const logger: ConsolaInstance = useLogger('nuxt-language-negotiation')

export const LANGUAGE_CONTEXT_KEY = '__language_context'

export const defaultOptions: ModuleOptions = {
  availableLanguages: [],
  defaultLanguage: '',
  defaultLanguageNoPrefix: false,
  negotiators: [],
  prefixMapping: {},
  queryStringKeys: ['__language_context'],
  cookieName: '__language_context',
  debug: false,
}

/**
 * Validate the module options.
 */
export function validateOptions(options: Partial<ModuleOptions>) {}

export const fileExists = (
  path?: string,
  extensions = ['js', 'ts', 'mjs'],
): string | null => {
  if (!path) {
    return null
  } else if (existsSync(path)) {
    return path
  }

  const extension = extensions.find((extension) =>
    existsSync(`${path}.${extension}`),
  )

  return extension ? `${path}.${extension}` : null
}

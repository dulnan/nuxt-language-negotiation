import { existsSync } from 'node:fs'
import { useLogger } from '@nuxt/kit'
import type { ConsolaInstance } from 'consola'

export const logger: ConsolaInstance = useLogger('nuxt-language-negotiation')

export const LANGUAGE_CONTEXT_KEY = '__language_context'

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

export function toValidVariableName(input: string): string {
  // Replace non-alphanumeric characters with underscores.
  let result = input.replace(/\W/g, '_')

  // Ensure the first character is not a number.
  if (/^\d/.test(result)) {
    result = '_' + result
  }

  // Handle empty string edge case
  if (result === '') {
    result = '_empty'
  }

  return result
}

/**
 * Type check for falsy values.
 *
 * Used as the callback for array.filter, e.g.
 * items.filter(falsy)
 */
export function nonNullish<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}

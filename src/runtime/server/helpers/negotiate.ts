import {
  defaultLanguageNoPrefix,
  defaultLangcode,
  langcodes,
  prefixToLangcode,
} from '#nuxt-language-negotiation/config'
import { parseAcceptLanguage } from 'intl-parse-accept-language'
import { isValidLanguage } from '../../helpers/isValidLanguage'

/**
 * The negotiation logic of the server negotiators, without a server API.
 *
 * The negotiators in ../negotiator read the request and call these functions.
 * The *.portable.ts files (Nitro v3) read the web-standard request event
 * (RequestEvent). They do not import nuxt/server, because the Vue app imports
 * them too: useCurrentLanguage() negotiates during SSR. The other files use
 * h3 (Nitro v2).
 */

/**
 * Get the query from URLSearchParams in the shape of getQuery() of h3: a
 * repeated key gives an array of its values. The portable negotiators use it,
 * so that they get the same results as the h3 ones.
 */
export function queryFromSearchParams(
  params: URLSearchParams,
): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = Object.create(null)
  for (const [key, value] of params) {
    const existing = query[key]
    if (existing === undefined) {
      query[key] = value
    } else if (Array.isArray(existing)) {
      existing.push(value)
    } else {
      query[key] = [existing, value]
    }
  }
  return query
}

/**
 * Get the language from the path prefix.
 */
export function languageFromPath(
  path: string,
  query: Record<string, unknown>,
): string | undefined {
  // If we are rendering a nuxt error page, we need to use the *actual* url
  // of the page, which is available as a query parameter.
  const actualPath =
    path.startsWith('/__nuxt_error') && typeof query.url === 'string'
      ? query.url
      : path

  // The first path segment, without the query or hash.
  const matches = /^\/([^/?#]+)/.exec(actualPath)
  const prefix = matches?.[1]

  if (prefix) {
    const langcode = prefixToLangcode[prefix]
    if (langcode) {
      return langcode
    }
  }

  // If we didn't find a match and if the default language has no prefix, return the default language.
  if (defaultLanguageNoPrefix) {
    return defaultLangcode
  }
}

/**
 * Get the language from the first of the query keys with a valid language.
 */
export function languageFromQuery(
  query: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = query[key]
    if (value && typeof value === 'string' && isValidLanguage(value)) {
      return value
    }
  }
}

/**
 * Get the language from the Accept-Language HTTP header.
 */
export function languageFromAcceptLanguage(
  header: string | null | undefined,
): string | undefined {
  if (!header) {
    return
  }

  const result = parseAcceptLanguage(header)
  return result.find((v) => langcodes.includes(v as any))
}

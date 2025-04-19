import type { H3Event } from 'h3'
import type { PageLanguage } from '#language-negotiation/language'

export type BuiltInNegotiators =
  | 'pathPrefix'
  | 'acceptLanguage'
  | 'queryString'
  | 'cookie'

export type Negotiators = BuiltInNegotiators | (string & {})

export type LanguageNegotiatorPublicConfig = {
  availableLanguages: PageLanguage[]
  queryStringKeys: string[]
  debug: boolean
  prefixMapping: Record<PageLanguage, string>
  cookieName: string
  negotiators: Partial<Record<BuiltInNegotiators, boolean>>
  defaultLanguageNoPrefix: boolean
  defaultLanguage: PageLanguage
}

export type LanguageNegotiator = (
  event: H3Event,
  config: LanguageNegotiatorPublicConfig,
) => string | undefined | null

export type ModuleOptions = {
  /**
   * Define the available languages.
   *
   * In general this is a two character code (e.g. 'en', 'de' or 'fr'), but you
   * can also use locale style codes ('de-DE', 'en-GB', etc.).
   */
  availableLanguages: string[]

  /**
   * The default language. Must be present in availableLanguages.
   * This is the language that's being used if no negotiator returned a
   * language.
   *
   * If empty then the first one is used.
   */
  defaultLanguage?: string

  /**
   * Whether the default language should not use a prefix.
   */
  defaultLanguageNoPrefix?: boolean

  /**
   * Available negotiators.
   */
  negotiators: Negotiators[]

  /**
   * Provide an object that maps the prefix to a language. If empty, the
   * provided languages are used as the prefix.
   *
   * @example
   * prefixMapping: {
   *   '/de': 'de',
   *   '/gb': 'en',
   *   '/us': 'en',
   *   '/fr': 'fr',
   * }
   */
  prefixMapping?: Record<string, string>

  /**
   * Array of query keys to use for the `queryString` negotiator.
   *
   * Useful for server handlers / APIs without a language prefix:
   * /api/getProduct?id=123&language=en
   * /api/getProducts?__language_context=de
   *
   * @example
   *  ['language', '__language_context']
   *
   * @default ['language']
   */
  queryStringKeys?: string[]

  /**
   * Name of the cookie to store the language in.
   */
  cookieName?: string

  /**
   * Log helpfull debugging messages.
   */
  debug?: boolean
}

export type LanguageLink = {
  code: string
  to: any
  active: boolean
}

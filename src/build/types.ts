import type { ModuleHelper } from './classes/ModuleHelper'

export type LanguageNegotiatorDefinition<T extends object = object> = {
  name: string
  options: T
  init: (helper: ModuleHelper, options: T) => void
}

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
  negotiators: LanguageNegotiatorDefinition[]

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
   * Log helpful debugging messages.
   */
  debug?: boolean
}

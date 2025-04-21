import type { LanguageBase } from '../runtime/types'
import type { ModuleHelper } from './classes/ModuleHelper'

export type LanguageNegotiatorDefinition<T = any> = {
  name: string
  options: T
  init: (helper: ModuleHelper, options: T) => void
}

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type ModuleOptionsLanguages = Array<
  Optional<LanguageBase, 'prefix' | 'label'> | string
>

export type ModuleOptions = {
  /**
   * Define the available languages.
   *
   * In general this is a two character code (e.g. 'en', 'de' or 'fr'), but you
   * can also use locale style codes ('de-DE', 'en-GB', etc.).
   */
  languages: ModuleOptionsLanguages

  /**
   * Available negotiators.
   */
  negotiators: LanguageNegotiatorDefinition[]

  /**
   * Log helpful debugging messages.
   */
  debug?: boolean
}

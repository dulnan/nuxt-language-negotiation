import type { H3Event } from 'h3'

export type LanguageNegotiatorContext = {
  availableLanguages: string[]
  event: H3Event
}

export type LanguageNegotiator = (
  context: LanguageNegotiatorContext,
) => string | undefined

export type LanguageNegotiatorOptions = {
  server?: boolean
  client?: boolean
}

export type LanguageNegotiatorSetupContext = {
  resolve: (v: string) => string
}

export type LanguageNegotiatorDefinition = {
  name: string
  callback: LanguageNegotiator
  setup?: (ctx: LanguageNegotiatorSetupContext) => void
}

export type NuxtLanguageNegotiationOptions = {
  /**
   * Define the available languages.
   *
   * In general this is a two character code (e.g. 'en', 'de' or 'fr'), but you
   * can also use locale style codes ('de-DE', 'en-GB', etc.).
   */
  availableLanguages: string[]

  /**
   * Available negotiators.
   */
  negotiators: LanguageNegotiatorDefinition[]

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

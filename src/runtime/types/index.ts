import type { H3Event } from 'h3'
import type { RouteLocationRaw } from 'vue-router'

type LanguageLinkAvailable = {
  enabled: true
  to: RouteLocationRaw
}

type LanguageLinkDisabled = {
  enabled: false
  to: undefined
}

export type LanguageLinkBase<T extends string = string> = {
  code: T
  active: boolean
} & (LanguageLinkAvailable | LanguageLinkDisabled)

export type ServerOptions = {
  /**
   * Negotiate the language before the negotiators. A result that is not a
   * language code is skipped, and the negotiators decide.
   */
  negotiate?: (event: H3Event) => string | null | undefined
}

export type BuiltInNegotiators =
  'pathPrefix' | 'acceptLanguage' | 'queryString' | 'cookie'

export type ServerNegotiator<E = H3Event> = {
  negotiate: (event: E) => string | null | undefined
}

export type LanguageBase<T extends string = string> = {
  code: T
  label: string
  prefix: string
}

export {}

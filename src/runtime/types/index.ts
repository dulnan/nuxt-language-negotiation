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

export type ServerOptions<T extends string = string> = {
  negotiate?: (
    event: H3Event,
  ) => T | null | undefined | Promise<T | null | undefined>
}

export type BuiltInNegotiators =
  | 'pathPrefix'
  | 'acceptLanguage'
  | 'queryString'
  | 'cookie'

export type ServerNegotiator = {
  negotiate: (event: H3Event) => string | null | undefined
}

export type LanguageBase<T extends string = string> = {
  code: T
  label: string
  prefix: string
}

export {}

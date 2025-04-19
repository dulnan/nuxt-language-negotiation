type LanguageLinkAvailable = {
  enabled: true
  to: string
}

type LanguageLinkDisabled = {
  enabled: false
  to: undefined
}

export type LanguageLinkBase<T extends string = string> = {
  code: T
  active: boolean
} & (LanguageLinkAvailable | LanguageLinkDisabled)

export {}

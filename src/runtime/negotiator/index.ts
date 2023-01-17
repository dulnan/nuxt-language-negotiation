import type {
  LanguageNegotiator,
  LanguageNegotiatorDefinition,
  LanguageNegotiatorOptions,
  LanguageNegotiatorSetupContext,
} from './../types'

export function defineLanguageNegotiator(
  name: string,
  callback: LanguageNegotiator,
  setup?: (ctx: LanguageNegotiatorSetupContext) => void,
): LanguageNegotiatorDefinition {
  return {
    name,
    callback,
    setup,
  }
}

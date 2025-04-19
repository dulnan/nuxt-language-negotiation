import type { ModuleHelper } from './../build/classes/ModuleHelper'
import type { LanguageNegotiatorDefinition } from './../build/types'

export function defineLanguageNegotiator<
  T extends object,
  V = object extends T ? true : false,
>(
  name: string,
  init: (helper: ModuleHelper, options?: T) => void,
): V extends true
  ? (options?: T) => LanguageNegotiatorDefinition<T>
  : (options: T) => LanguageNegotiatorDefinition<T> {
  return (options?: T) => {
    return { name, init, options: options as T }
  }
}

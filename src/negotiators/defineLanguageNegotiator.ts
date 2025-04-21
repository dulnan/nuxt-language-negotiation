import type { ModuleHelper } from './../build/classes/ModuleHelper'
import type { LanguageNegotiatorDefinition } from './../build/types'

type IsOptionalObject<T> = T extends object
  ? object extends T
    ? true
    : false
  : true

// The defineLanguageNegotiator function with proper typing
export function defineLanguageNegotiator<T = any>(
  name: string,
  init: (helper: ModuleHelper, options: T) => void,
): IsOptionalObject<T> extends true
  ? (options?: T) => LanguageNegotiatorDefinition<T>
  : (options: T) => LanguageNegotiatorDefinition<T> {
  return (options?: T) => {
    return {
      name,
      options: (options || {}) as T,
      init,
    }
  }
}

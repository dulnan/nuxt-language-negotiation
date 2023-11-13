import type { Ref } from 'vue'

/**
 * Return the current country.
 */
export function useCurrentCountry(): Ref<string> {
  return useState('currentCountry', '')
}

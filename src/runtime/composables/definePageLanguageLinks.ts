import { useState } from '#imports'

/**
 * Return the current language.
 */
export function definePageLanguageLinks(
  path: string,
  links: Record<string, string>,
): void {
  const statePath = useState('pageLanguageLinksPath', () => '')
  const stateLinks = useState('pageLanguageLinksLinks', () => ({}))
  statePath.value = path
  stateLinks.value = links
}

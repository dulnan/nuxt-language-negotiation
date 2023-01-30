/**
 * Return the current language.
 */
export function definePageLanguageLinks(
  path: string,
  links: Record<string, string>,
): void {
  const app = useNuxtApp()

  app.$pageLanguageLinks.links.value = links
  app.$pageLanguageLinks.path.value = path
}

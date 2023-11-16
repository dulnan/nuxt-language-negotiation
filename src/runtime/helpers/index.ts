export function getLanguageFromPath(path = ''): string | undefined {
  if (!path) {
    return
  }

  // Get the locale code (e.g. /en/ or /en-US/) from the path
  const matches = /\/([^/]+(-[A-Z]{2})?)/.exec(path)

  // remove -US if present
  return matches?.[1].replace(/-[A-Z]{2}$/, '')
}

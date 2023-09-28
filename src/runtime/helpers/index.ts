export function getLanguageFromPath(path = ''): string | undefined {
  if (!path) {
    return
  }

  const matches = /\/([^/]+)/.exec(path)
  return matches?.[1]
}

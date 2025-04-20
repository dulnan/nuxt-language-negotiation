export function cleanPagePath(path: string): string {
  // Remove duplicate slashes.
  const collapsed = path.replace(/\/{2,}/g, '/')

  // Remove trailing slashes unless the path is exactly "/".
  return collapsed.length > 1 ? collapsed.replace(/\/+$/, '') : collapsed
}

export function getFullPagePath(path: string, parentPath = ''): string {
  if (path.startsWith('/')) {
    return path
  }
  return parentPath + '/' + path
}

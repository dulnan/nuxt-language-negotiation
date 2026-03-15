// These are Nitro auto-imports at runtime but the app tsconfig can't see them.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const defineEventHandler: (handler: (event: any) => any) => any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const getCurrentLanguage: (event: any) => string

export default defineEventHandler((event) => {
  const language = getCurrentLanguage(event)
  return { language }
})

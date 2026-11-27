/**
 * Returns the language the server negotiates for this request.
 */
export default defineEventHandler((event) => {
  return { language: useCurrentLanguage(event) }
})

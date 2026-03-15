export default defineEventHandler((event) => {
  const language = getCurrentLanguage(event)
  return { language }
})

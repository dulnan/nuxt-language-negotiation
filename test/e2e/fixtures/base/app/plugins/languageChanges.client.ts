/**
 * Like the plugins in apps that load their menus again when the language
 * changes: records the language a request sees after each change.
 */
export default defineNuxtPlugin({
  name: 'test:language-changes',
  dependsOn: ['nuxt:router', 'test:client-context'],
  setup(nuxtApp) {
    const changes = useState<string[]>('test:languageChanges', () => [])
    const language = useCurrentLanguage()
    watch(language, () => {
      changes.value.push(nuxtApp.$clientContext().language)
    })
  },
})

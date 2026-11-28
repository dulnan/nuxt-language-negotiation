/**
 * Like the client options of nuxt-graphql-middleware in apps that use the
 * module: every request reads the current language when it is sent.
 */
export default defineNuxtPlugin({
  name: 'test:client-context',
  setup() {
    return {
      provide: {
        clientContext: () => ({ language: useCurrentLanguage().value }),
      },
    }
  },
})

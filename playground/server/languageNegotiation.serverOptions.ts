import { defineLanguageServerOptions } from './../../src/server-options'

export default defineLanguageServerOptions({
  negotiate(event) {
    const path = event.path
    if (path.startsWith('/api/always-german')) {
      return 'de'
    }
  },
})

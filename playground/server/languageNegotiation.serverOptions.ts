import { defineLanguageServerOptions } from './../../src/server-options'

export default defineLanguageServerOptions({
  negotiate() {
    return ''
  },
})

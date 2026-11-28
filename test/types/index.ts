/**
 * Type tests: this file is only type-checked (npm run typecheck), not run.
 *
 * The languages are the ones of npm run dev:prepare: de, en, fr and it.
 */
import { definePageLanguageLinks } from '../../src/runtime/app/composables/definePageLanguageLinks'
import { defineLanguageServerOptions } from '../../src/server-options'

// A page that only exists in some languages.
definePageLanguageLinks({ de: '/de/ueber-uns', en: '/en/about-us' })

// @ts-expect-error Not a language code.
definePageLanguageLinks({ xx: '/xx/about-us' })

// The result is checked at runtime, so any string can be returned.
defineLanguageServerOptions({
  negotiate(event) {
    return event.headers.get('x-language')
  },
})

defineLanguageServerOptions({
  negotiate() {
    return 'fr'
  },
})

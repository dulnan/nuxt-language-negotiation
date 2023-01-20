import { defineEventHandler } from 'h3'
import { ref } from 'vue'
import { LANGUAGE_CONTEXT_KEY } from '../settings'

/**
 * Set the language context based on the negotiated language.
 */
export default defineEventHandler(async (event) => {
  if (event.context[LANGUAGE_CONTEXT_KEY]) {
    return
  }

  const negotiatedLanguage: string = event.context.__negotiated_language || 'de'
  event.context[LANGUAGE_CONTEXT_KEY] = ref(negotiatedLanguage)
})

import type { H3Event } from 'h3'
import { defineEventHandler } from 'h3'
import { ref } from 'vue'
import { LANGUAGE_CONTEXT_KEY } from '../settings'
import { getModuleConfig } from '../helpers/getModuleConfig'
import { NuxtLanguageNegotiationOptions } from '../types'

function negotiateLanguage(
  event: H3Event,
  config: NuxtLanguageNegotiationOptions,
): string | undefined {
  for (let i = 0; i < config.negotiators.length; i++) {
    const negotiator = config.negotiators[i]
    if (negotiator.callback) {
      const negotiatedLanguage = negotiator.callback({
        event,
        availableLanguages: config.availableLanguages,
      })
      if (negotiatedLanguage) {
        return negotiatedLanguage
      }
    }
  }
}

export default defineEventHandler(async (event) => {
  if (event.context[LANGUAGE_CONTEXT_KEY]) {
    return
  }
  if (!event.path) {
    return
  }

  if (event.path.match(/\.(ico|js|png|css|jpg|bmp|gif|svg|vue|mjs)/)) {
    return
  }

  const config = await getModuleConfig()
  const language = negotiateLanguage(event, config) || 'de'

  console.log(language)

  event.context[LANGUAGE_CONTEXT_KEY] = ref(language)
})

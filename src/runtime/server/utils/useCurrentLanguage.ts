import {
  type Langcode,
  defaultLangcode,
} from '#nuxt-language-negotiation/config'
import type { H3Event } from 'h3'
import { serverOptions, negotiators } from '#nuxt-language-negotiation/server'
import { isValidLanguage } from '../../helpers/isValidLanguage'

function negotiate(event: H3Event): Langcode {
  if (serverOptions.negotiate) {
    const result = serverOptions.negotiate(event)
    if (isValidLanguage(result)) {
      return result
    }
  }

  for (const negotiator of negotiators) {
    const result = negotiator.negotiate(event)
    if (isValidLanguage(result)) {
      return result
    }
  }

  return defaultLangcode
}

export function useCurrentLanguage(event: H3Event): Langcode {
  if (event.context.negotiatedLanguage) {
    return event.context.negotiatedLanguage
  }

  const language = negotiate(event)
  event.context.negotiatedLanguage = language
  return language
}

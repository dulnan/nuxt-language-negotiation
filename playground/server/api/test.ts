import { defineEventHandler } from 'h3'
import { useCurrentLanguage } from './../../../src/runtime/server/utils/useCurrentLanguage'

export default defineEventHandler(async (event) => {
  const language = await useCurrentLanguage(event)
  return {
    api: 'This is data from the API.',
    language,
    now: new Date(),
  }
})

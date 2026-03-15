import { defineEventHandler } from 'h3'
import { getCurrentLanguage } from './../../../src/runtime/server/utils/getCurrentLanguage'

export default defineEventHandler(async (event) => {
  const language = await getCurrentLanguage(event)
  return {
    api: 'This is data from the API.',
    language,
    now: new Date(),
  }
})

import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
  return {
    api: 'This is data from the API.',
    now: new Date(),
  }
})

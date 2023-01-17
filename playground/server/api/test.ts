export default defineEventHandler((event) => {
  return {
    api: 'This is data from the API.',
    now: new Date(),
  }
})

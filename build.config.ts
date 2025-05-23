import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['./src/server-options.ts', './src/negotiators.ts'],
  externals: [
    'unstorage',
    'defu',
    'h3',
    'pathe',
    'consola',
    'accept-language-parser',
    '#nuxt-language-negotiation/config',
    '#nuxt-language-negotiation/server',
    'iso-639-1',
  ],
  replace: {
    'process.env.PLAYGROUND_MODULE_BUILD': 'undefined',
    'process.env.PLAYGROUND_DEV': 'undefined',
  },
})

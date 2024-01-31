import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  externals: ['unstorage', 'defu', 'h3', '#language-negotiation/language'],
})

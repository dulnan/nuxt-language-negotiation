import withNuxt from './playground/.nuxt/eslint.config.mjs'
import prettier from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default withNuxt({
  plugins: {
    prettier,
  },
  rules: {
    ...eslintConfigPrettier.rules,
    ...eslintPluginPrettierRecommended.rules,
  },
})
  .override('nuxt/typescript/rules', {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  })
  .append({
    // Pages and the error page of the E2E fixture apps, which the Nuxt config
    // above (from the playground) does not know about.
    files: [
      'test/e2e/fixtures/*/app/pages/**/*.vue',
      'test/e2e/fixtures/*/app/error.vue',
    ],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  })

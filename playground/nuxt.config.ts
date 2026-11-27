import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'
import { pathPrefix, cookie, acceptLanguage, query } from './../src/negotiators'
import type { ModuleOptions } from '../src/build/types'
import NuxtLanguageNegotiation from './../src/module'

const languageNegotiation: ModuleOptions = {
  languages: [
    'de',
    'en',
    'fr',
    'it',
    {
      code: 'gsw_CH',
      prefix: 'ch',
      label: 'Schwizerdütsch',
    },
  ],
  negotiators: [
    pathPrefix(),
    query({
      keys: ['language'],
    }),
    cookie(),
    acceptLanguage(),
  ],
  debug: true,
}

export default defineNuxtConfig({
  // Nitro v2 by default; PLAYGROUND_NITRO=3 (npm run dev:nitro3) for Nitro v3.
  _nitroMajor: process.env.PLAYGROUND_NITRO === '3' ? 3 : 2,

  modules: [NuxtLanguageNegotiation, '@nuxt/eslint'],

  languageNegotiation,

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
    tsConfig: {
      exclude: ['../server'],
    },
  },

  experimental: {
    scanPageMeta: true,
    extraPageMetaExtractionKeys: ['languageMapping'],
    asyncContext: true,
  },

  compatibilityDate: '2025-04-19',
  future: {
    compatibilityVersion: 4,
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      minify: false,
    },
    server: {
      watch: {
        usePolling: true,
      },
    },
  },
})

<template>
  <div>This page has custom translated aliases.</div>
</template>

<script lang="ts" setup>
definePageMeta({
  name: 'page-with-aliases',
  path: '/:language/path-english',
  alias: [
    '/:language/path-french',
    '/:language/path-italian',
    '/:language/path-german',
  ],
  languageMapping: {
    en: '/en/path-english',
    fr: '/fr/path-french',
    it: '/it/path-italian',
    de: '/de/path-german',
  },
})
</script>

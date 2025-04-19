<template>
  <div>This page has custom translated aliases.</div>
</template>

<script lang="ts" setup>
definePageMeta({
  name: 'page-with-aliases',
  path: '/path-german',
  languageMapping: {
    de: '/path-german',
    en: '/en/path-english',
    fr: '/fr/path-french',
    it: '/it/path-italian',
  },
})
</script>

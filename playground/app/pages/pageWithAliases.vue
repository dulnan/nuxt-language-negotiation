<template>
  <div>This page has custom translated aliases.</div>
</template>

<script lang="ts" setup>
import { definePageMeta } from '#imports'

definePageMeta({
  name: 'page-with-aliases',
  path: '/path-german',
  languageMapping: {
    en: '/path-english',
    fr: '/path-french',
    it: '/path-italian',
  },
})
</script>

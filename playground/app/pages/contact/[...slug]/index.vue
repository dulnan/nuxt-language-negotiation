<template>
  <div>Contact</div>
</template>

<script lang="ts" setup>
import { definePageMeta } from '#imports'

definePageMeta({
  path: '/kontakt/:slug(.*)*',
  languageMapping: {
    fr: '/contact/:slug(.*)*',
    en: '/contact/:slug(.*)*',
  },
})
</script>

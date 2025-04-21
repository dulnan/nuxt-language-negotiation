<template>
  <div>This is a catch all category route.</div>
</template>

<script setup lang="ts">
definePageMeta({
  name: 'products-category',
  path: 'kategorie/:slug(.*)*',
  languageMapping: {
    en: 'category/:slug(.*)*',
    fr: 'categoria/:slug(.*)*',
  },
})
</script>

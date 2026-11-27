<template>
  <div>
    <h1>Products</h1>
    <NuxtPage />
  </div>
</template>

<script lang="ts" setup>
// Mapped parent page for every language.
definePageMeta({
  name: 'products',
  path: '/produkte',
  languageMapping: {
    en: '/products',
    fr: '/produits',
    gsw_CH: '/produkt',
  },
})
</script>

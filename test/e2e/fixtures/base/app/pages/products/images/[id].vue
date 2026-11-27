<template>
  <div>Images of product {{ route.params.id }}</div>
</template>

<script lang="ts" setup>
// Mapped child page with a relative path, without a variant for gsw_CH.
definePageMeta({
  name: 'products-images',
  path: 'bilder/:id',
  languageMapping: {
    en: 'images/:id',
    fr: 'images/:id',
  },
})

const route = useRoute()
</script>

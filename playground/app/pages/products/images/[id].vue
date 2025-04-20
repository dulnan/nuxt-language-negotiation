<template>
  <div>
    <h1 class="text-xl font-bold">Product images: {{ id }}</h1>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  name: 'products-images',
  path: 'bilder/:id',
  languageMapping: {
    en: 'images/:id',
    fr: 'images/:id',
    it: 'immagini/:id',
  },
})

const route = useRoute()

const id = computed(() => route.params.id)
</script>

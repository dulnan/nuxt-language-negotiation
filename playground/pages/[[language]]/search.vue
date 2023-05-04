<template>
  <div>
    <NuxtLink to="/suchen">TO the German search</NuxtLink>
    <!-- <NuxtLink :to="{ name: 'search', params: { language: 'de' } }" -->
    <!--   >TO the German search</NuxtLink -->
    <!-- > -->
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  alias: [
    '/:language?/rechercher',
    '/:language?/ricerca',
    '/:language?/suchen',
  ],
  languageMapping: {
    de: '/suchen',
    fr: '/fr/rechercher',
    it: '/it/ricerca',
  },
})
</script>

<template>
  <div>SEARCH</div>
</template>

<script lang="ts" setup>
definePageMeta({
  alias: ['/:language/rechercher', '/:language/ricerca', '/:language/suchen'],
  languageMapping: {
    de: '/de/suchen',
    fr: '/fr/rechercher',
    it: '/it/ricerca',
  },
})
</script>

<template>
  <div>Search</div>
</template>

<script lang="ts" setup>
// Mapped page without a variant for gsw_CH.
definePageMeta({
  path: '/suchen',
  languageMapping: {
    en: '/search',
    fr: '/rechercher',
  },
})
</script>

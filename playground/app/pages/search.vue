<template>
  <div>SEARCH</div>
</template>

<script lang="ts" setup>
import { definePageMeta } from '#imports'

definePageMeta({
  path: '/suchen',
  languageMapping: {
    en: '/search',
    fr: '/rechercher',
    it: '/ricerca',
  },
})
</script>

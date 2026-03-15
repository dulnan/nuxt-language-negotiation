<template>
  <div>
    <h1 data-testid="page-title">Search</h1>
    <span data-testid="current-language">{{ language }}</span>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta, useCurrentLanguage } from '#imports'

definePageMeta({
  path: '/search',
  languageMapping: {
    de: '/suchen',
    fr: '/rechercher',
  },
})

const language = useCurrentLanguage()
</script>

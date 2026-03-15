<template>
  <div>
    <h1 data-testid="page-title">Search</h1>
    <span data-testid="current-language">{{ language }}</span>
  </div>
</template>

<script setup lang="ts">
import { useCurrentLanguage } from '#imports'

declare const definePageMeta: (meta: Record<string, unknown>) => void

definePageMeta({
  path: '/search',
  languageMapping: {
    de: '/suchen',
    fr: '/rechercher',
  },
})

const language = useCurrentLanguage()
</script>

<template>
  <div>
    <h1 data-testid="page-title">About</h1>
    <span data-testid="current-language">{{ language }}</span>
  </div>
</template>

<script setup lang="ts">
import { useCurrentLanguage } from '#imports'

const language = useCurrentLanguage()
</script>

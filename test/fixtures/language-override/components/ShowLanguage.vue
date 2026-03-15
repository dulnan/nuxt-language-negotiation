<template>
  <span data-testid="current-language">{{ language }}</span>
</template>

<script setup lang="ts">
import { useCurrentLanguage } from '#imports'

const language = useCurrentLanguage()
</script>

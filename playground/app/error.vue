<template>
  <div>Error page current language: {{ language }}</div>
</template>

<script setup lang="ts">
import { useCurrentLanguage } from '#imports'

const language = useCurrentLanguage()
</script>

<template>
  <span data-testid="language-code">{{ language.code }}</span>
  <span data-testid="language-label">{{ language.label }}</span>
  <span data-testid="language-prefix">{{ language.prefix }}</span>
</template>

<script setup lang="ts">
import { useCurrentLanguage } from '#imports'

const language = useCurrentLanguage({ full: true })
</script>

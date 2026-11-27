<template>
  <div>
    <h1>Error {{ error.statusCode }}</h1>
    <TestState :status-code="error.statusCode" />
  </div>
</template>

<script lang="ts" setup>
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()
</script>

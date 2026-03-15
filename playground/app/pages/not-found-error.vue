<template>
  <div>This is a 404.</div>
</template>

<script setup lang="ts">
import { createError } from '#imports'

throw createError({
  statusCode: 404,
})
</script>

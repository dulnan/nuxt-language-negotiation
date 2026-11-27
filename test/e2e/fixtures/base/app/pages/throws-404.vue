<template>
  <div>Never rendered</div>
</template>

<script lang="ts" setup>
throw createError({ statusCode: 404, statusMessage: 'Not found' })
</script>

<template>
  <div>This is a 404.</div>
</template>

<<script setup lang="ts">
throw createError({
  statusCode: 404
})
</script>

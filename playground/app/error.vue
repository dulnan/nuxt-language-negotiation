<template>
  <div>Error page current language: {{ language }}</div>
</template>

<script setup lang="ts">
  const language = useCurrentLanguage()
</script>

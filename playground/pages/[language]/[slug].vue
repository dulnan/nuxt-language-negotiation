<template>
  <div id="home">
    <div>{{ slug }}</div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const slug = computed(() => {
  return route.params.slug
})
</script>

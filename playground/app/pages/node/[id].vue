<template>
  <div>Node: {{ nid }}</div>
</template>

<script setup lang="ts">
import { useRoute, computed } from '#imports'

const route = useRoute()

const nid = computed(() => route.params.nid)
</script>

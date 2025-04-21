<template>
  <div>Node: {{ nid }}</div>
</template>

<script setup lang="ts">
const route = useRoute()

const nid = computed(() => route.params.nid)
</script>

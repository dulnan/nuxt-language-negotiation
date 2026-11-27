<template>
  <div>Node {{ route.params.id }}</div>
</template>

<script lang="ts" setup>
// Page without a mapping, with a param.
const route = useRoute()
</script>

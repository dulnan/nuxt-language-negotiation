<template>
  <div>
    <h1 class="text-xl font-bold">Product: {{ id }}</h1>
    <NuxtLink :to="{ name: 'products-images' }"> Show images </NuxtLink>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  name: 'products-detail',
})

const route = useRoute()

const id = computed(() => route.params.id)
</script>

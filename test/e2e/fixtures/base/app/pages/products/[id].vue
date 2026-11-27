<template>
  <div>
    <h2>Product {{ route.params.id }}</h2>
    <NuxtLink data-testid="to-images" :to="{ name: 'products-images' }">
      Images
    </NuxtLink>
  </div>
</template>

<script lang="ts" setup>
// Child page without a mapping, in a mapped parent.
definePageMeta({
  name: 'products-detail',
})

const route = useRoute()
</script>

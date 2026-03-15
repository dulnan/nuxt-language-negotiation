<template>
  <div>
    <h1>Home</h1>
    <NuxtLink :to="{ name: 'about' }">About</NuxtLink>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  name: 'home',
})
</script>

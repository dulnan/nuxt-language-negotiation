<template>
  <div class="main-layout">
    <div>{{ language }}</div>
    <header>
      <Navbar />
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { useCurrentLanguage } from '~/.nuxt/imports'

const language = useCurrentLanguage()
</script>

<style>
.main-layout {
  display: grid;
  grid-template-columns: 20rem 1fr;
  grid-gap: 2rem;
  padding: 2rem;
}
</style>

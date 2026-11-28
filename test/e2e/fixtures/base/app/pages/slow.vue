<template>
  <div>
    <div data-testid="page-language">{{ language }}</div>
  </div>
</template>

<script lang="ts" setup>
// On client-side navigation, this page loads until the test calls
// window.releaseSlowPage(). Meanwhile, the previous page stays visible.
const nuxtApp = useNuxtApp()
const language = useCurrentLanguage()

if (import.meta.client && !nuxtApp.isHydrating) {
  await new Promise<void>((resolve) => {
    ;(window as any).releaseSlowPage = resolve
  })
}
</script>

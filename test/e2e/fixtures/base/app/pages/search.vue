<template>
  <div>
    <div>Search</div>
    <pre data-testid="fetch-languages">{{ fetchLanguages }}</pre>
  </div>
</template>

<script lang="ts" setup>
// Mapped page without a variant for gsw_CH.
definePageMeta({
  path: '/suchen',
  languageMapping: {
    en: '/search',
    fr: '/rechercher',
  },
})

// Like a page that loads its data with GraphQL queries: the language each
// request sees, also for one sent after an await.
const route = useRoute()
const { $clientContext } = useNuxtApp()
const { data: first } = await useAsyncData('first:' + route.path, () =>
  Promise.resolve($clientContext().language),
)
const { data: second } = await useAsyncData('second:' + route.path, () =>
  Promise.resolve($clientContext().language),
)
const fetchLanguages = computed(() =>
  JSON.stringify([first.value, second.value]),
)
</script>

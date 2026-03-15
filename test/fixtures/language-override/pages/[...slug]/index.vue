<template>
  <div>
    <h1 data-testid="page-title">{{ page?.title ?? 'Not Found' }}</h1>
    <span data-testid="current-language">{{ language }}</span>
  </div>
</template>

<script setup lang="ts">
import {
  useCurrentLanguage,
  useRoute,
  useAsyncData,
  definePageLanguageLinks,
} from '#imports'

const route = useRoute()
const language = useCurrentLanguage()

const dynamicPages = [
  {
    title: 'Dynamic Page',
    languageLinks: {
      en: '/en/dynamic-page',
      de: '/de/dynamische-seite',
      fr: '/fr/page-dynamique',
    },
  },
]

const { data: page } = await useAsyncData(route.path, () => {
  return Promise.resolve(
    dynamicPages.find((v) =>
      Object.values(v.languageLinks).some((link) => route.path === link),
    ),
  )
})

if (page.value) {
  definePageLanguageLinks(page.value.languageLinks)
}
</script>

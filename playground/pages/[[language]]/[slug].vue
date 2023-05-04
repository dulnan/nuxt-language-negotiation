<template>
  <div v-if="page" id="home">
    <h1 class="text-4xl font-bold">{{ page.title }}</h1>
    <p class="text-xl font-light">{{ route.path }}</p>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useAsyncData } from '#imports'

const route = useRoute()

type DynamicPage = {
  title: string
  languageLinks: Record<string, string>
}

const dynamicPages: DynamicPage[] = [
  {
    title: 'Page 1',
    languageLinks: {
      de: '/page-1-german',
      en: '/en/page-1-english',
      fr: '/fr/page-1-french',
      it: '/it/page-1-italian',
    },
  },
  {
    title: 'Page 2',
    languageLinks: {
      de: '/page-2-german',
      en: '/en/page-2-english',
      fr: '/fr/page-2-french',
      it: '/it/page-2-italian',
    },
  },
  {
    title: 'Page 3',
    languageLinks: {
      de: '/page-3-german',
      en: '/en/page-3-english',
      fr: '/fr/page-3-french',
      it: '/it/page-3-italian',
    },
  },
]

const { data: page } = await useAsyncData(route.path, () => {
  return Promise.resolve(
    dynamicPages.find((v) => {
      return !!Object.keys(v.languageLinks).some((code) => {
        return route.path === v.languageLinks[code]
      })
    }),
  )
})
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}
definePageLanguageLinks(route.path, page.value.languageLinks)
</script>

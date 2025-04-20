<template>
  <header class="bg-white shadow-xl absolute top-0 left-0 h-full w-60 px-6">
    <div class="py-2">
      <div>
        <div class="font-bold">Current langugage</div>
        <div>{{ language }}</div>
      </div>
      <div>
        <div class="font-bold">Current route</div>
        <div>{{ route.name }}</div>
      </div>
      <div>
        <div class="font-bold">Language from API</div>
        <div>{{ data?.language }}</div>
      </div>
    </div>
    <h2 class="text-xl font-bold mt-10">Menu</h2>
    <ul>
      <li v-for="(page, i) in pages" :key="i">
        <NuxtLink
          :to="page"
          exact-active-class="text-blue-700"
          class="block py-2 font-bold"
        >
          {{ page.path || page.name }}
        </NuxtLink>
      </li>
    </ul>

    <h2 class="text-xl font-bold mt-10">Language Links</h2>
    <ClientOnly>
      <ul>
        <li v-for="(link, i) in languageLinks" :key="i + link.code">
          <NuxtLink
            v-if="link.enabled"
            :to="link.to"
            exact-active-class="text-blue-700"
            class="block py-2 font-bold"
          >
            {{ link.label }}
          </NuxtLink>
          <div v-else class="block py-2">
            {{ link.label }}
          </div>
        </li>
      </ul>
    </ClientOnly>
  </header>
</template>

<script lang="ts" setup>
import { defaultLanguageNoPrefix } from '#nuxt-language-negotiation/config'

const pages = computed(() => {
  return [
    { name: 'search' },
    { name: 'page-with-aliases' },
    { name: 'products' },
    {
      path: defaultLanguageNoPrefix ? '/page-2-german' : '/de/page-2-german',
    },
    { path: '/en/page-1-english' },
    { name: 'deeply-nested' },
  ]
})

const route = useRoute()
const language = useCurrentLanguage()
const languageLinks = useLanguageLinks()

const { data } = await useAsyncData(() => {
  return $fetch('/api/test', {
    query: {
      language: language.value,
    },
  })
})
</script>

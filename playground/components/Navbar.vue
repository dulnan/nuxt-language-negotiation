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
    </div>
    <h2 class="text-xl font-bold mt-10">Menu</h2>
    <ul>
      <li v-for="(page, i) in pages" :key="i">
        <nuxt-link v-slot="{ href, isActive, navigate }" :to="page" custom>
          <a
            :href="href"
            class="block py-2 font-bold"
            :class="{ 'text-blue-700': isActive }"
            @click="navigate"
            >{{ href }}</a
          >
        </nuxt-link>
      </li>
    </ul>

    <h2 class="text-xl font-bold mt-10">Language Links</h2>
    <!-- <ul> -->
    <!--   <li v-for="(link, i) in languageLinks" :key="i + link.code"> -->
    <!--     <nuxt-link v-slot="{ href, isActive, navigate }" :to="link.to" custom> -->
    <!--       <a -->
    <!--         :href="href" -->
    <!--         class="block py-2 font-bold" -->
    <!--         :class="{ 'text-blue-700': isActive }" -->
    <!--         @click="navigate" -->
    <!--         >{{ href }}</a -->
    <!--       > -->
    <!--     </nuxt-link> -->
    <!--   </li> -->
    <!-- </ul> -->
  </header>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const pages = computed(() => {
  return [
    { name: 'search' },
    { name: 'page-with-aliases' },
    { path: '/en/page-1-english' },
    { path: '/page-2-german' },
  ]
})

const app = useNuxtApp()

const route = useRoute()
const language = useCurrentLanguage()
// const languageLinks = useLanguageLinks()

// console.log(languageLinks)
</script>

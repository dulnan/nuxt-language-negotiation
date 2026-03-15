<template>
  <div>
    <nav>
      <ul>
        <li v-for="link in languageLinks" :key="link.code">
          <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
        </li>
      </ul>
    </nav>
    <p>Current language: {{ language }}</p>
    <NuxtPage />
  </div>
</template>

<script lang="ts" setup>
const language = useCurrentLanguage()
const languageLinks = useLanguageLinks()
</script>

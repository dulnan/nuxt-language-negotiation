<template>
  <div>
    <h1 data-testid="page-title">Language Links</h1>
    <span data-testid="current-language">{{ language }}</span>

    <nav data-testid="language-links">
      <template v-for="link in links" :key="link.code">
        <NuxtLink
          v-if="link.enabled"
          :to="link.to"
          :data-testid="`lang-link-${link.code}`"
          :data-active="link.active"
        >
          {{ link.label }}
        </NuxtLink>
        <span
          v-else
          :data-testid="`lang-link-${link.code}`"
          data-disabled="true"
        >
          {{ link.label }}
        </span>
      </template>
    </nav>

    <NuxtLink to="/en/search" data-testid="link-search-en">Search EN</NuxtLink>
    <NuxtLink :to="{ name: 'search' }" data-testid="link-search-auto">Search Auto</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { useCurrentLanguage, useLanguageLinks } from '#imports'

const language = useCurrentLanguage()
const links = useLanguageLinks()
</script>

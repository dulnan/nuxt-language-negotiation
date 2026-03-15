<template>
  <div>
    <h1 data-testid="page-title">Router Test</h1>
    <span data-testid="current-language">{{ language }}</span>

    <!-- Links using route names (resolve() is tested via rendered href) -->
    <NuxtLink :to="{ name: 'search' }" data-testid="link-name-search">
      Search by name
    </NuxtLink>
    <NuxtLink :to="{ name: 'about' }" data-testid="link-name-about">
      About by name
    </NuxtLink>

    <!-- Link with explicit language suffix (should NOT be double-translated) -->
    <NuxtLink :to="{ name: 'search___fr' }" data-testid="link-name-search-fr">
      Search FR explicit
    </NuxtLink>

    <!-- Link using path string (should pass through unchanged) -->
    <NuxtLink to="/fr/rechercher" data-testid="link-path-string">
      Search FR path
    </NuxtLink>

    <!-- Buttons for programmatic navigation -->
    <button data-testid="btn-push-search" @click="pushSearch">
      Push search
    </button>
    <button data-testid="btn-replace-search" @click="replaceSearch">
      Replace search
    </button>
    <button data-testid="btn-push-about" @click="pushAbout">
      Push about
    </button>
  </div>
</template>

<script setup lang="ts">
import { useCurrentLanguage, useRouter } from '#imports'

const language = useCurrentLanguage()
const router = useRouter()

function pushSearch() {
  router.push({ name: 'search' })
}

function replaceSearch() {
  router.replace({ name: 'search' })
}

function pushAbout() {
  router.push({ name: 'about' })
}
</script>

<template>
  <nav class="menu">
    <nuxt-link to="/search">Search (EN)</nuxt-link>
    <nuxt-link to="/suche">Search (DE)</nuxt-link>
    <nuxt-link to="/de/hello">Hello (DE)</nuxt-link>
    <nuxt-link :to="{ name: 'language-overview' }"
      >Overview (Current language)</nuxt-link
    >
    <nuxt-link :to="{ name: 'language-overview', params: { language: 'de' } }"
      >Overview (Always DE)</nuxt-link
    >

    <ul>
      <li v-for="link in links">
        <nuxt-link :to="link.to">{{ link.code }}</nuxt-link>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
import { useAsyncData } from 'nuxt/app'
import { useLanguageLinks } from '~/.nuxt/imports'

const links = useLanguageLinks()
</script>

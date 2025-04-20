<template>
  <div>
    <h1>Products</h1>
    <ul>
      <li v-for="product in products" :key="product.id">
        <NuxtLink
          :to="{
            name: 'products-detail',
            params: {
              id: product.id,
            },
          }"
        >
          {{ product.name }}
        </NuxtLink>
      </li>
    </ul>
    <div>
      <NuxtPage />
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  name: 'products',
  path: '/produkte',
  languageMapping: {
    fr: '/produits',
    it: '/prodotti',
    en: '/products',
  },
})

const products = [
  {
    id: '1',
    name: 'Foobar 1',
  },
  {
    id: '2',
    name: 'Foobar 2',
  },
]
</script>

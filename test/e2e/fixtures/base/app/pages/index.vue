<template>
  <div>
    <h1>Front page</h1>
    <NuxtLink data-testid="to-search" :to="{ name: 'search' }">Search</NuxtLink>
    <NuxtLink
      data-testid="to-product"
      :to="{ name: 'products-detail', params: { id: '7' } }"
    >
      Product 7
    </NuxtLink>
  </div>
</template>

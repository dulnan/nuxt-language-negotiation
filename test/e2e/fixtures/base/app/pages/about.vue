<template>
  <div>
    <h1>About</h1>
    <!-- A child page without a mapping, in a parent without a mapping. -->
    <NuxtLink data-testid="to-team" :to="{ name: 'about-team' }">Team</NuxtLink>
    <NuxtPage />
  </div>
</template>

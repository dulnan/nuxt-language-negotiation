<template>
  <div>
    <NuxtPage />
    <NuxtLink data-testid="to-unprefixed" to="/unprefixed-page">
      Page without a prefix
    </NuxtLink>
    <TestState />
  </div>
</template>

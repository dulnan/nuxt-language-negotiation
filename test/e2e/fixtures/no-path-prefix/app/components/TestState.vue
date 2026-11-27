<template>
  <pre data-testid="state">{{ state }}</pre>
</template>

<script lang="ts" setup>
/**
 * Replaces the TestState of the base layer: useLanguageLinks() needs the
 * pathPrefix negotiator.
 */
const props = defineProps<{
  statusCode?: number
}>()

const route = useRoute()
const language = useCurrentLanguage()
const fullLanguage = useCurrentLanguage({ full: true })

const hydrated = ref(false)
onMounted(() => {
  hydrated.value = true
})

const state = computed(() =>
  JSON.stringify({
    language: language.value,
    fullLanguage: fullLanguage.value,
    routeName: route.name ?? null,
    routePath: route.path,
    statusCode: props.statusCode ?? null,
    links: [],
    hydrated: hydrated.value,
  }),
)
</script>

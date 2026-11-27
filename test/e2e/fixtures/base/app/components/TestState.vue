<template>
  <pre data-testid="state">{{ state }}</pre>
</template>

<script lang="ts" setup>
/**
 * Renders what the module returns for the current request as JSON, so that
 * tests can read it from the SSR HTML and, after hydration, from the page.
 */
const props = defineProps<{
  statusCode?: number
}>()

const route = useRoute()
const router = useRouter()
const language = useCurrentLanguage()
const fullLanguage = useCurrentLanguage({ full: true })
const languageLinks = useLanguageLinks()

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
    links: languageLinks.value.map((link) => ({
      code: link.code,
      enabled: link.enabled,
      active: link.active,
      href: link.enabled && link.to ? router.resolve(link.to).href : null,
    })),
    hydrated: hydrated.value,
  }),
)
</script>

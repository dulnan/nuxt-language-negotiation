<template>
  <div>
    <nav>
      <template v-for="link in links" :key="link.code">
        <NuxtLink
          v-if="link.href"
          :to="link.href"
          :data-testid="`lang-${link.code}`"
        >
          {{ link.code }}
        </NuxtLink>
      </template>
    </nav>
    <pre data-testid="state">{{ state }}</pre>
  </div>
</template>

<script lang="ts" setup>
/**
 * Renders what the module returns for the current request as JSON, so that
 * tests can read it from the SSR HTML and, after hydration, from the page.
 * Also renders a language switcher from the language links.
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

const links = computed(() =>
  languageLinks.value.map((link) => {
    let href: string | null = null
    let resolveError: string | null = null
    if (link.enabled && link.to) {
      try {
        href = router.resolve(link.to).href
      } catch (e) {
        resolveError = e instanceof Error ? e.message : String(e)
      }
    }
    return {
      code: link.code,
      enabled: link.enabled,
      active: link.active,
      href,
      resolveError,
    }
  }),
)

const state = computed(() =>
  JSON.stringify({
    language: language.value,
    fullLanguage: fullLanguage.value,
    routeName: route.name ?? null,
    routePath: route.path,
    statusCode: props.statusCode ?? null,
    links: links.value,
    hydrated: hydrated.value,
  }),
)
</script>

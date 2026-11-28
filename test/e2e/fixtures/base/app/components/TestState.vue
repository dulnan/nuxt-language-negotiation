<template>
  <div>
    <nav>
      <template v-for="link in links" :key="link.code">
        <NuxtLink
          v-if="link.path"
          :to="link.path"
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
    // href includes the base URL, path (for NuxtLink) does not.
    let href: string | null = null
    let path: string | null = null
    let resolveError: string | null = null
    if (link.enabled && link.to) {
      try {
        const resolved = router.resolve(link.to)
        href = resolved.href
        path = resolved.fullPath
      } catch (e) {
        resolveError = e instanceof Error ? e.message : String(e)
      }
    }
    return {
      code: link.code,
      enabled: link.enabled,
      active: link.active,
      to: link.to ?? null,
      href,
      path,
      resolveError,
    }
  }),
)

// Like the pagination of apps that use the module: a link to the current
// route by its name and params.
const paginationHref = computed(() => {
  if (!route.name) {
    return null
  }
  try {
    return router.resolve({
      name: route.name,
      params: route.params,
      query: { ...route.query, page: '2' },
    }).href
  } catch (e) {
    return `Error: ${e instanceof Error ? e.message : String(e)}`
  }
})

// Set by the languageChanges plugin, on the client only.
const languageChanges = useState<string[]>('test:languageChanges', () => [])

const state = computed(() =>
  JSON.stringify({
    language: language.value,
    fullLanguage: fullLanguage.value,
    routeName: route.name ?? null,
    originalName: route.meta.originalName ?? null,
    routePath: route.path,
    statusCode: props.statusCode ?? null,
    links: links.value.map(({ path: _, ...link }) => link),
    paginationHref: paginationHref.value,
    languageChanges: languageChanges.value,
    hydrated: hydrated.value,
  }),
)
</script>

<template>
  <div>{{ page.title }}</div>
</template>

<script lang="ts" setup>
import { defaultLanguageNoPrefix } from '#nuxt-language-negotiation/config'

/**
 * Top-level catch-all, the module leaves it without a language prefix. The
 * pages set their language links with definePageLanguageLinks().
 */
const route = useRoute()

const de = defaultLanguageNoPrefix ? '' : '/de'

const pages: {
  title: string
  links: Record<string, string>
  likeVuepal?: boolean
}[] = [
  {
    title: 'Page 1',
    links: { de: `${de}/seite-1`, en: '/en/page-1', fr: '/fr/page-1' },
  },
  // A page without a language prefix.
  { title: 'Unprefixed page', links: {} },
  {
    title: 'CMS page',
    links: { de: `${de}/cms-seite`, en: '/en/cms-page', fr: '/fr/page-cms' },
    likeVuepal: true,
  },
]
const paths: Record<string, number> = {
  [`${de}/seite-1`]: 0,
  '/en/page-1': 0,
  '/fr/page-1': 0,
  '/unprefixed-page': 1,
  [`${de}/cms-seite`]: 2,
  '/en/cms-page': 2,
  '/fr/page-cms': 2,
}

const index = paths[route.path]
if (index === undefined) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}
const page = pages[index]!

if (page.likeVuepal) {
  // Like vuepal: write the links straight into the state that
  // definePageLanguageLinks() uses, keyed by the path.
  const stateLinks = useState<Record<string, Record<string, string>>>(
    'pageLanguageLinks',
    () => ({}),
  )
  if (!stateLinks.value[route.path]) {
    stateLinks.value[route.path] = page.links
  }
} else {
  definePageLanguageLinks(page.links)
}
</script>

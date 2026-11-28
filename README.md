# Nuxt Language Negotiation

Negotiates the language of every request on the server and keeps it in sync on
the client. Optionally adds a language prefix to every route, with translated
paths per page.

It's minimal by design and is not a replacement for
[@nuxtjs/i18n](https://github.com/nuxt-modules/i18n).

- Requires Nuxt 3.17 or later. Tested with Nuxt 4 on Nitro v2 and v3.
- Supports `app.baseURL`.

## Features

- Language negotiation on the server, in the order you choose: path prefix,
  query string, cookie, `Accept-Language`, or your own logic.
- One current language for the request, the same on the server and the client.
- Language prefixes for routes (`/en/search`), with translated paths per page
  (`/de/suchen`).
- Language links for a language switcher.

## What it doesn't do

- Translations or localization.
- Meta tags or SEO (`hreflang`, canonical links).
- Multiple domains.
- Setting the language cookie.
- A language switcher component (but see
  [`useLanguageLinks()`](#uselanguagelinks)).

## Setup

```bash
npm install nuxt-language-negotiation
```

```typescript
// nuxt.config.ts
import {
  pathPrefix,
  query,
  cookie,
  acceptLanguage,
} from 'nuxt-language-negotiation/negotiators'

export default defineNuxtConfig({
  modules: ['nuxt-language-negotiation'],

  languageNegotiation: {
    // The first language is the default language.
    languages: ['de', 'en', 'fr'],

    // The first negotiator that returns a valid language wins. If none does,
    // the default language is used.
    negotiators: [
      pathPrefix(),
      query({ keys: ['language'] }),
      cookie(),
      acceptLanguage(),
    ],

    // Log the routes the module builds.
    debug: false,
  },
})
```

## Languages

A language is a code, or an object with a code and an optional prefix and label:

```typescript
languages: [
  'de',
  'en',
  { code: 'gsw_CH', prefix: 'ch', label: 'Schwizerdütsch' },
]
```

- **`code`:** letters, `_` and `-`. Must be unique.
- **`prefix`:** the path prefix for the `pathPrefix` negotiator. Defaults to the
  code. Must be unique. Only the default language can have an empty prefix, see
  [Default language without a prefix](#default-language-without-a-prefix).
- **`label`:** defaults to the native name of an ISO 639-1 code (`de` is
  `Deutsch`). Required for other codes, like `de-CH`.

## Negotiators

The negotiators run in the order you list them. The
[server options](#server-options) run before all of them. A result that is not
one of the language codes is skipped.

The language is negotiated once per request, on the server. The client gets it
with the payload.

### `pathPrefix()`

The language of the first path segment: `/fr/rechercher` is `fr`. It also
[adds the prefix to every route](#routing). A path without a language prefix,
like `/api/search`, gives no result, so the next negotiator runs.

On an error page, it uses the path of the page that failed.

### `query({ keys })`

The language of the first query key with a valid language:
`query({ keys: ['language', 'lang'] })` reads `/api/search?language=fr`. A key
that is repeated (`?language=en&language=fr`) is skipped.

Useful for API routes, which usually have no language prefix.

### `cookie({ cookieName })`

The language of a cookie. The cookie name defaults to `negotiatedLanguage`.

The module only reads the cookie. Set it yourself, for example when the user
picks a language.

### `acceptLanguage()`

The language with the highest quality in the `Accept-Language` header that is
one of the language codes. With languages `de` and `fr`, the header
`fr-CH, fr;q=0.9, en;q=0.8` gives `fr`.

## Routing

With the `pathPrefix` negotiator, every page gets a language prefix:

```
pages/
  index.vue          /de, /en, /fr
  about.vue          /de/about, /en/about, /fr/about
  search.vue         /de/suchen, /en/search, /fr/rechercher (languageMapping)
  products/[id].vue  /de/products/1, /en/products/1, /fr/products/1
  [...slug].vue      every other path, without a prefix
```

`/` redirects to the front page of the negotiated language, for example `/fr`.
The query string is kept. This doesn't happen when the default language has no
prefix.

### Translated paths

By default, a page has the same path in every language. Use `languageMapping` to
give it a path per language. The page's `path` is the path of the default
language:

```vue
<!-- pages/search.vue -->
<script setup lang="ts">
definePageMeta({
  path: '/suchen',
  languageMapping: {
    en: '/search',
    fr: '/rechercher',
  },
})
</script>
```

- **A language without a path in the mapping** has no route for this page. The
  page's language link is disabled.
- **An empty mapping (`languageMapping: {}`)** makes the page available only in
  the default language.
- **Child pages** of a mapped page get the parent's path in each language. A
  child can have its own mapping, with paths relative to the parent:

  ```typescript
  // pages/products/images/[id].vue, with a mapped parent pages/products.vue
  definePageMeta({
    path: 'bilder/:id',
    languageMapping: {
      en: 'images/:id',
      fr: 'images/:id',
    },
  })
  ```

A mapped page gets a route per language, named `<name>___<code>`, for example
`search___fr`. `route.meta.originalName` is the name of the page (`search`).

Every page needs a name, and a path must not start with a language prefix. The
module logs an error for such pages and skips them. A production build fails.

### Catch-all page

A top-level catch-all page (`pages/[...slug].vue`) gets no prefix. It matches
every path that no other route matches, in every language. If the path starts
with a language prefix (`/fr/some-page`), that's the language. Otherwise the
next negotiators decide.

Set its language links with
[`definePageLanguageLinks()`](#definepagelanguagelinks), for example from a CMS.

### Linking

Link to a page by its name, and the module picks the route of the current
language:

```vue
<!-- On /fr, this links to /fr/rechercher. -->
<NuxtLink :to="{ name: 'search' }">Search</NuxtLink>
```

This works for `NuxtLink`, `router.push()`, `router.replace()` and
`router.resolve()`. If the page has no route in the current language, the link
goes to the default language.

To link to a specific language:

- **A mapped page:** use the route name of that language,
  `{ name: 'search___en' }`.
- **A page without a mapping:** set the `langPrefix` param,
  `{ name: 'about', params: { langPrefix: 'en' } }`.

A path (`to="/en/search"`) is used as it is.

### Default language without a prefix

Give the default language an empty prefix:

```typescript
languages: [{ code: 'de', prefix: '' }, 'en', 'fr']
```

- The default language's pages have no prefix (`/suchen`), the others do
  (`/en/search`).
- `/` is the default language's front page, without a redirect.
- Only the default language can have an empty prefix. Otherwise the build fails.

A path without a prefix is always in the default language. So `pathPrefix()`
returns the default language for every such path, and **the negotiators after it
never run**. That also applies to API routes: `/api/search?language=fr` gives
the default language. To negotiate API routes differently, use the
[server options](#server-options), which run first.

## Server options

Create `server/languageNegotiation.serverOptions.ts` to negotiate the language
yourself. It runs before the negotiators. Return a language code, or nothing to
let the negotiators decide.

```typescript
// server/languageNegotiation.serverOptions.ts
import { defineLanguageServerOptions } from 'nuxt-language-negotiation/server-options'

export default defineLanguageServerOptions({
  negotiate(event) {
    if (event.headers.get('host') === 'example.fr') {
      return 'fr'
    }
  },
})
```

`event` is the h3 event of the request. Its type is the h3 v1 `H3Event`, but on
Nitro v3 it's an h3 v2 event. These work on both:

- `event.headers`, a `Headers` object
- `event.method`
- `event.context`
- `event.path`, which includes `app.baseURL` on Nitro v3, not on Nitro v2

Code for h3 v1 only, like `event.node.req`, breaks on Nitro v3. `event.req` is
the Node request on Nitro v2 and a web `Request` on Nitro v3.

## Composables

### `useCurrentLanguage()`

The current language.

```typescript
const language = useCurrentLanguage() // ComputedRef<'de' | 'en' | 'fr'>
const full = useCurrentLanguage({ full: true }) // ComputedRef<{ code, label, prefix }>
```

On the server, also in API routes, pass the event. It's auto-imported:

```typescript
// server/api/search.ts
export default defineEventHandler((event) => {
  const language = useCurrentLanguage(event)
})
```

### `useLanguageLinks()`

A link to the current page in every language, for a language switcher:

```vue
<template>
  <nav>
    <template v-for="link in languageLinks" :key="link.code">
      <NuxtLink
        v-if="link.enabled"
        :to="link.to"
        :class="{ active: link.active }"
      >
        {{ link.label }}
      </NuxtLink>
      <span v-else>{{ link.label }}</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
const languageLinks = useLanguageLinks()
</script>
```

Each link has the language's `code`, `label` and `prefix`, plus:

- **`enabled`:** whether the page exists in that language.
- **`to`:** the route location, if enabled.
- **`active`:** whether it's the current language.

The links come from [`definePageLanguageLinks()`](#definepagelanguagelinks),
then from the routes the `pathPrefix` negotiator builds. Without `pathPrefix`,
only `definePageLanguageLinks()` sets links, and every other link is disabled.

### `definePageLanguageLinks()`

Sets the language links of the current page, for pages whose paths the module
doesn't know, like a catch-all page:

```typescript
definePageLanguageLinks({
  de: '/de/ueber-uns',
  en: '/en/about-us',
  fr: '/fr/a-propos',
})
```

A language without a path gets a disabled link.

## On the client

- **Hydration:** the client starts with the language the server negotiated.
- **Navigation:** after client-side navigation, the language comes from the path
  prefix. On a path without a prefix, it's the default language if the default
  language has no prefix. Otherwise the language of the previous page stays.
- **Timing:** like `useRoute()`, a page keeps its language until it's replaced.
  Outside of pages, like in layouts, `app.vue` or plugins, the language changes
  once the next page has loaded.
- **Without SSR (`ssr: false`):** the language comes from the path prefix, or is
  the default language.

## Types

`#nuxt-language-negotiation/config` exports the types and the configured
languages:

```typescript
import {
  type Langcode,
  type Language,
  type LanguageLink,
  languages,
  defaultLangcode,
} from '#nuxt-language-negotiation/config'
```

## `app.baseURL`

Supported on Nitro v2 and v3. The base is not part of the language prefix: with
`app.baseURL: '/shop/'`, `/shop/` redirects to `/shop/fr`. On Nitro v3, set the
base at build time.

## Development

```bash
npm install
npm run dev:prepare

# The playground, on Nitro v2 or v3.
npm run dev
npm run dev:nitro3

# Unit and E2E tests. The E2E tests need Chromium:
# npx playwright-core install chromium
npm test
```

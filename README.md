# Nuxt Language Negotiation

[![npm version](https://img.shields.io/npm/v/nuxt-language-negotiation.svg)](https://www.npmjs.com/package/nuxt-language-negotiation)
[![License](https://img.shields.io/npm/l/nuxt-language-negotiation.svg)](https://github.com/dulnan/nuxt-language-negotiation/blob/main/LICENSE)

Pluggable language negotiation for Nuxt. Detects the current language from URL
path prefixes, cookies, query parameters, or Accept-Language headers and
provides a reactive, SSR-safe language state.

## Features

- SSR-compatible language detection with pluggable negotiators
- Build-time route transformation for multi-language paths via `languageMapping`
- Reactive `useCurrentLanguage()` composable (code or full language object)
- `useLanguageLinks()` for building language switchers
- `<LanguageOverride>` component for scoped language overrides
- `getCurrentLanguage(event)` server util (auto-imported)
- Custom negotiator and server options APIs
- Nuxt 4 compatible

## Installation

```bash
npm install nuxt-language-negotiation
```

Add the module to your `nuxt.config.ts`:

```typescript
import {
  pathPrefix,
  cookie,
  acceptLanguage,
  query,
} from 'nuxt-language-negotiation/negotiators'

export default defineNuxtConfig({
  modules: ['nuxt-language-negotiation'],

  languageNegotiation: {
    languages: ['de', 'en', 'fr'],
    negotiators: [pathPrefix(), acceptLanguage()],
  },
})
```

## Configuration

The module is configured under the `languageNegotiation` key in
`nuxt.config.ts`.

### `languages`

An array of language codes (strings) or language objects. The **first entry is
the default language**.

```typescript
languages: [
  // String shorthand — label is auto-detected from ISO 639-1.
  'de',
  'en',

  // Object form — full control.
  {
    code: 'gsw_CH',
    prefix: 'ch', // URL prefix (defaults to code)
    label: 'Schwizerdütsch',
  },
]
```

| Property | Required | Default          | Description                                                       |
| -------- | -------- | ---------------- | ----------------------------------------------------------------- |
| `code`   | yes      | —                | Language identifier (letters, `_`, `-`).                          |
| `prefix` | no       | same as `code`   | URL path segment. Use `''` for no prefix on the default language. |
| `label`  | no       | ISO 639-1 lookup | Human-readable name.                                              |

### `negotiators`

An ordered array of negotiator functions. During a request the module runs each
negotiator in order and uses the **first match**. See
[Negotiators](#negotiators-1) below.

### `debug`

Set to `true` to log negotiation decisions on both client and server.

## Negotiators

Import negotiators from `nuxt-language-negotiation/negotiators`:

```typescript
import {
  pathPrefix,
  query,
  cookie,
  acceptLanguage,
} from 'nuxt-language-negotiation/negotiators'
```

### `pathPrefix()`

Detects the language from the first URL path segment (e.g. `/en/about`). At
build time it transforms your page routes to include a `:langPrefix` parameter
and generates per-page language link mappings used by `useLanguageLinks()`.

No options. Requires Nuxt's `scanPageMeta` experimental feature (the module
enables it automatically).

### `query(options)`

Reads the language from a query parameter.

```typescript
query({ keys: ['language', 'lang'] })
```

| Option | Required | Description                     |
| ------ | -------- | ------------------------------- |
| `keys` | yes      | Query parameter names to check. |

### `cookie(options?)`

Reads the language from a cookie.

```typescript
cookie()
cookie({ cookieName: 'preferredLanguage' })
```

| Option       | Required | Default                | Description  |
| ------------ | -------- | ---------------------- | ------------ |
| `cookieName` | no       | `'negotiatedLanguage'` | Cookie name. |

### `acceptLanguage()`

Parses the `Accept-Language` HTTP header. No options.

## Routing with `pathPrefix`

When `pathPrefix()` is active, you can define per-language paths with
`languageMapping` in `definePageMeta`:

```vue
<!-- pages/search.vue -->
<script setup>
definePageMeta({
  path: '/suchen',
  languageMapping: {
    en: '/search',
    fr: '/rechercher',
  },
})
</script>
```

This produces routes like `/de/suchen`, `/en/search`, and `/fr/rechercher`.
Languages not listed in `languageMapping` inherit the default `path`.

### Default language without prefix

If the default language should have no URL prefix, set its `prefix` to an empty
string:

```typescript
languages: [
  { code: 'de', prefix: '' }, // /suchen
  'en', // /en/search
]
```

### Route params

`languageMapping` works with dynamic segments:

```vue
<script setup>
definePageMeta({
  path: '/kontakt/:slug(.*)*',
  languageMapping: {
    en: '/contact/:slug(.*)*',
  },
})
</script>
```

## Composables

### `useCurrentLanguage()`

Returns a computed ref with the current language code. Call with
`{ full: true }` to get the full language object instead.

```typescript
const langcode = useCurrentLanguage()
// ComputedRef<'de' | 'en' | 'fr'>

const language = useCurrentLanguage({ full: true })
// ComputedRef<{ code: Langcode; label: string; prefix: string }>
```

### `useLanguageLinks()`

Returns a computed ref with language link information for the current route.
Useful for building a language switcher.

```typescript
const links = useLanguageLinks()
```

Each entry has the shape:

```typescript
type LanguageLink = {
  code: Langcode
  label: string
  prefix: string
  active: boolean // true for the current language
  enabled: boolean // true if a route exists for this language
  to: RouteLocationRaw | undefined
}
```

Example template:

```vue
<template>
  <nav>
    <template v-for="link in links" :key="link.code">
      <NuxtLink v-if="link.enabled" :to="link.to">
        {{ link.label }}
      </NuxtLink>
      <span v-else>{{ link.label }}</span>
    </template>
  </nav>
</template>
```

### `definePageLanguageLinks(links)`

Dynamically defines language links for the current page at runtime. Useful for
catch-all or dynamic routes where static `languageMapping` isn't possible.

```typescript
definePageLanguageLinks({
  de: '/seite-1',
  en: '/en/page-1',
  fr: '/fr/page-1',
})
```

## Components

### `<LanguageOverride>`

Overrides the language returned by `useCurrentLanguage()` for all components in
its slot.

Props:

| Prop       | Type             | Description                                 |
| ---------- | ---------------- | ------------------------------------------- |
| `langcode` | `string \| null` | Language code to use, or `null` to disable. |

Slot props: `{ langcode: Langcode | null }`

```vue
<template>
  <LanguageOverride langcode="fr">
    <!-- useCurrentLanguage() returns "fr" inside here -->
    <MyComponent />
  </LanguageOverride>
</template>
```

## Server API

### `getCurrentLanguage(event)`

Auto-imported server util. Returns the negotiated language code for the current
request.

```typescript
export default defineEventHandler((event) => {
  const language = getCurrentLanguage(event)
  return { language }
})
```

### Custom server options

Create `server/languageNegotiation.serverOptions.ts` in your app to add custom
server-side negotiation logic that runs **before** all built-in negotiators:

```typescript
import { defineLanguageServerOptions } from 'nuxt-language-negotiation/server-options'

export default defineLanguageServerOptions({
  negotiate(event) {
    // Return a language code or null to fall through.
    const user = getUserFromSession(event)
    return user?.language ?? null
  },
})
```

## Custom Negotiators

Build your own negotiator with `defineLanguageNegotiator` from
`nuxt-language-negotiation/negotiators`:

```typescript
import { defineLanguageNegotiator } from 'nuxt-language-negotiation/negotiators'

export const customHeader = defineLanguageNegotiator<{
  headerName?: string
}>('customHeader', (helper, options) => {
  const headerName = options.headerName || 'X-Language'
  helper.addServerNegotiator('customHeader', { headerName })
})
```

The `helper` object provides methods to hook into the module:

- `addServerNegotiator(name, options?)` — register a server-side negotiator
- `addPlugin(name, mode?)` — add a runtime plugin
- `addServerMiddleware(name)` — add server middleware
- `addComposable(name)` — register a composable
- `addComponent(name)` — register a component
- `addServerUtil(name)` — register a server util

It also exposes properties like `helper.languages`, `helper.defaultLanguage`,
`helper.nuxt`, and `helper.debug`.

Use the custom negotiator in your config:

```typescript
negotiators: [customHeader({ headerName: 'X-Lang' }), pathPrefix()]
```

## What this module doesn't do

This module is not a replacement for
[@nuxtjs/i18n](https://github.com/nuxt-modules/i18n) and doesn't aim to be one.
The following features are not provided:

- Translations / localization
- Meta tags / SEO
- Multi-domain
- Multiple strategies (prefix, domain, default) on the same app

## License

[MIT](./LICENSE)

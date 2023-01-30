# Nuxt Language Negotiation

This module provides basic multi-language support for a Nuxt 3 app. It's
minimal by design and tries to do one thing only.

I created this module because I mostly work on large CMS powered websites that 

## Features

- SSR language negotiation/detection based on path prefix, `Accept-Language` or custom (e.g. via API).
- Single source of truth for "current language" state
- Multi-language routes (single route for multiple languages with different path per language)

## What it doesn't do

This module is not a replacement for
[@nuxtjs/i18n](https://github.com/nuxt-modules/i18n) and doesn't aim to be one.
The following features are not provided and are left to the user of the module:

- Translations / localization
- Meta tags / SEO
- Multi domain
- Language switcher
- Multiple strategies (prefix, domain, default)

## Usage

### Setup

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-language-negotiation'],

  languageNegotiation: {
    // Define the available languages.
    availableLanguages: ['en', 'de', 'fr', 'it'],

    // We use two negotiators: Path prefix takes precedence. In cases where no
    // path prefix is available, we fallback to Accept-Language headers.
    negotiators: ['pathPrefix', 'acceptLanguage'],

    // Write debug messages to the console on client and server.
    debug: true,
  },
})
```

### Routing

The module assumes the following:

- Routes generall have a language prefix
  - e.g. `/en/search`, `/de/suche`, etc.
- Routes use a single param for the language prefix
  - e.g. `/:language/product/:id`.
- Routes without a language prefix are required to specify the language via route.meta
  - e.g. `/german-landing-page` only available in German, so it defines `de` in route.meta.language.
- Routes without a language prefix but with a specific path for every language specifiy the mapping via route.meta

This means your pages directory should look like this:

```
pages/
  [language]/
    index.vue
    search.vue
    products/
      [id].vue
      index.vue
  landing-page.vue
  index.vue
```

Internally the module *does not* create a route for each language. This means
there is a single route for every page in the pages folder. That way you can
continue to use <nuxt-link> und router.push() without having to "translate" the
route first:

```vue
<template>
  <nuxt-link :to="{ name: 'search' }">Search</nuxt-link>
</template>
```

When the current language is `de`, the resulting link will be `/de/suche`.



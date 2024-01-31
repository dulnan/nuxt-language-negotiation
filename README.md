# Nuxt Language Negotiation

This module provides basic multi-language support for a Nuxt 3 app. It's minimal
by design and tries to do one thing only.

## Features

- SSR language negotiation/detection based on path prefix, `Accept-Language` or
  custom (e.g. via API).
- Single source of truth for "current language" state
- Multi-language routes via `languageMapping` meta property

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
- Routes without a language prefix are required to specify the language via
  route.meta
  - e.g. `/german-landing-page` only available in German, so it defines `de` in
    route.meta.language.
- Routes without a language prefix but with a specific path for every language
  specifiy the mapping via route.meta

This means your pages directory should look like this:

```
pages/
  search.vue
  products/
    [id].vue
    index.vue
  landing-page.vue
  index.vue
```

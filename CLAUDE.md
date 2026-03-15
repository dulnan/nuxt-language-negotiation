# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`nuxt-language-negotiation` is a Nuxt module that provides multi-language support through pluggable language negotiation strategies. It handles language detection (from URL path prefixes, cookies, query params, Accept-Language headers) and route transformation at build time.

## Commands

```bash
# Development
npm run dev              # Run playground app (sets PLAYGROUND_DEV=true)
npm run dev:prepare      # Prepare module stubs + playground (run after cloning or changing module structure)
npm run dev:build        # Build playground for production
npm run dev:serve        # Serve built playground

# Testing
npm run test             # Run unit tests (vitest)
npm run test:watch       # Run tests in watch mode

# Type checking (runs vue-tsc against multiple tsconfig targets)
npm run typecheck        # All targets: build, runtime, server, playground

# Linting
npm run lint             # ESLint check (src/ only)
npm run lint:fix         # ESLint autofix
npm run prettier         # Prettier check (src/ only)
npm run prettier:fix     # Prettier autofix

# Build
npm run prepack          # Build module for publishing (nuxt-module-build)
```

## Architecture

### Build-time vs Runtime

The module has a clear separation between code that runs during Nuxt build/dev setup and code that runs in the app:

- **`src/build/`** — Build-time only. `ModuleHelper` is the central orchestrator that registers plugins, composables, components, templates, aliases, and server handlers with Nuxt. Templates in `src/build/templates/` generate runtime configuration files written to `.nuxt/nuxt-language-negotiation/`.
- **`src/runtime/app/`** — Client/universal runtime: composables (`useCurrentLanguage`, `useLanguageLinks`, `definePageLanguageLinks`), plugins (`router.ts`, `frontRedirect.ts`), and the `LanguageOverride` component.
- **`src/runtime/server/`** — Server runtime: `useCurrentLanguage(event)` server util, middleware.
- **`src/runtime/helpers/`** — Shared helpers used by both app and server runtime.

### Negotiator System

Negotiators are the core extensibility mechanism. Each negotiator in `src/negotiators/` uses `defineLanguageNegotiator()` and can:
- Hook into the build process via an `init(helper, options)` function
- Register server-side negotiation logic via `helper.addServerNegotiator()`
- Add plugins, middleware, or modify routes

The **pathPrefix** negotiator is the most complex — it includes `PageExtender` which transforms Nuxt's page routes at build time, adding language prefix params and generating per-page language link mappings.

### Generated Virtual Modules

The module generates these virtual imports (aliased via `#nuxt-language-negotiation/`):
- `config` — Language list, default language, prefix mappings
- `routes` — Page-level language link definitions
- `server` — Server negotiator chain and options

### Module Configuration

Configured under the `languageNegotiation` key in `nuxt.config.ts`. Users provide a `languages` array and a `negotiators` array. The first language in the array is the default.

### Additional Build Entry Points

`build.config.ts` uses unbuild to separately bundle `src/server-options.ts` and `src/negotiators.ts` as additional package exports (`nuxt-language-negotiation/server-options` and `nuxt-language-negotiation/negotiators`).

## Key Conventions

- Module requires Nuxt >=3.17.0 and supports Nuxt 4
- The playground (`playground/`) is a full Nuxt app used for manual testing and development — start it with `npm run dev`
- Unit tests live in `test/unit/` and use vitest with snapshot testing
- The `PLAYGROUND_DEV` and `PLAYGROUND_MODULE_BUILD` env vars control special behavior during module development (see `ModuleHelper` constructor)
- Server options file: users can create `server/languageNegotiation.serverOptions.ts` in their app to customize server-side behavior

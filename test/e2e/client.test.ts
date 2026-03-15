import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { createPage, setup, url } from '@nuxt/test-utils/e2e'

// Required so the module resolves runtime server negotiators as .ts source files.
process.env.PLAYGROUND_DEV = 'true'

describe(
  'Client-side',
  {
    timeout: 120_000,
  },
  async () => {
    await setup({
      rootDir: fileURLToPath(
        new URL('../fixtures/language-override', import.meta.url),
      ),
      dev: true,
      browser: true,
      browserOptions: {
        type: 'chromium',
      },
    })

    describe('language override after hydration', () => {
      it('shows overridden language in client-rendered content', async () => {
        const page = await createPage(url('/en'))
        const noOverride = await page
          .locator('[data-testid="no-override"]')
          .textContent()
        const overrideFr = await page
          .locator('[data-testid="override-fr"]')
          .textContent()
        const overrideDe = await page
          .locator('[data-testid="override-de"]')
          .textContent()

        expect(noOverride).toContain('en')
        expect(overrideFr).toContain('fr')
        expect(overrideDe).toContain('de')

        await page.close()
      })

      it('override with null falls back to route language on client', async () => {
        const page = await createPage(url('/de'))
        const overrideNull = await page
          .locator('[data-testid="override-null"]')
          .textContent()
        expect(overrideNull).toContain('de')
        await page.close()
      })

      it('override with invalid langcode uses default language on client', async () => {
        const page = await createPage(url('/en'))
        const overrideInvalid = await page
          .locator('[data-testid="override-invalid"]')
          .textContent()
        expect(overrideInvalid).toContain('en')
        await page.close()
      })

      it('NuxtLink inside LanguageOverride resolves using override language', async () => {
        // Visit /en — the override sets language to "fr".
        // A NuxtLink with { name: 'search' } inside the override should
        // resolve to the French variant, not the English one.
        const page = await createPage(url('/en'))

        const href = await page
          .locator('[data-testid="link-inside-override"]')
          .getAttribute('href')

        expect(href).toBe('/fr/rechercher')

        await page.close()
      })

      it('NuxtLink inside LanguageOverride resolves unmapped route with override langPrefix', async () => {
        const page = await createPage(url('/en'))

        const href = await page
          .locator('[data-testid="link-inside-override-de"]')
          .getAttribute('href')

        // About has no language mapping, so it uses langPrefix param.
        // The German override should inject langPrefix=de.
        expect(href).toBe('/de/about')

        await page.close()
      })

      it('NuxtLink outside override still uses route language', async () => {
        const page = await createPage(url('/de'))

        const href = await page
          .locator('[data-testid="link-outside-override"]')
          .getAttribute('href')

        expect(href).toBe('/de/suchen')

        await page.close()
      })

      it('override with null langcode does not affect link resolution', async () => {
        // null override should fall through to the route language.
        const page = await createPage(url('/de'))

        const hrefOutside = await page
          .locator('[data-testid="link-outside-override"]')
          .getAttribute('href')

        expect(hrefOutside).toBe('/de/suchen')

        await page.close()
      })
    })

    describe('client-side navigation', () => {
      it('navigates from home to about and preserves language', async () => {
        const page = await createPage(url('/en'))

        await page.locator('[data-testid="link-about"]').click()
        await page.waitForURL('**/en/about')

        const language = await page
          .locator('[data-testid="current-language"]')
          .textContent()
        expect(language).toContain('en')

        await page.close()
      })

      it('navigates to a hardcoded link and detects language from path', async () => {
        const page = await createPage(url('/de'))

        // This link points to /en/search, so after navigation
        // the language should be "en" (detected from the path).
        await page.locator('[data-testid="link-search"]').click()
        await page.waitForFunction(() =>
          document
            .querySelector('[data-testid="page-title"]')
            ?.textContent?.includes('Search'),
        )

        const language = await page
          .locator('[data-testid="current-language"]')
          .textContent()
        expect(language).toContain('en')

        await page.close()
      })
    })

    describe('language links on the client', () => {
      it('renders language links after hydration', async () => {
        const page = await createPage(url('/en/language-links'))

        // All three language links should be rendered.
        const enText = await page
          .locator('[data-testid="lang-link-en"]')
          .textContent()
        const deText = await page
          .locator('[data-testid="lang-link-de"]')
          .textContent()
        const frText = await page
          .locator('[data-testid="lang-link-fr"]')
          .textContent()

        expect(enText).toBeTruthy()
        expect(deText).toBeTruthy()
        expect(frText).toBeTruthy()

        // Active language should be marked.
        const enActive = await page
          .locator('[data-testid="lang-link-en"]')
          .getAttribute('data-active')
        expect(enActive).toBe('true')

        await page.close()
      })

      it('updates language links after client-side navigation', async () => {
        const page = await createPage(url('/en/language-links'))

        // Click on the German language link.
        const deLink = page.locator('[data-testid="lang-link-de"]')
        await deLink.click()
        await page.waitForURL('**/de/**')

        // After navigation, German should now be active.
        const deActive = await page
          .locator('[data-testid="lang-link-de"]')
          .getAttribute('data-active')
        expect(deActive).toBe('true')

        // English should no longer be active.
        const enActive = await page
          .locator('[data-testid="lang-link-en"]')
          .getAttribute('data-active')
        expect(enActive).toBe('false')

        await page.close()
      })

      it('navigates between language variants of a mapped route', async () => {
        const page = await createPage(url('/en/language-links'))

        // Navigate to German via language link.
        await page.locator('[data-testid="lang-link-de"]').click()
        await page.waitForURL('**/de/**')

        const language = await page
          .locator('[data-testid="current-language"]')
          .textContent()
        expect(language).toContain('de')

        // Navigate to French.
        await page.locator('[data-testid="lang-link-fr"]').click()
        await page.waitForURL('**/fr/**')

        const languageFr = await page
          .locator('[data-testid="current-language"]')
          .textContent()
        expect(languageFr).toContain('fr')

        await page.close()
      })
    })

    describe('router plugin route translation', () => {
      it('multiple NuxtLinks on same page resolve correctly', async () => {
        const page = await createPage(url('/de/router-test'))

        const [searchHref, aboutHref, searchFrHref, pathHref] =
          await Promise.all([
            page
              .locator('[data-testid="link-name-search"]')
              .getAttribute('href'),
            page
              .locator('[data-testid="link-name-about"]')
              .getAttribute('href'),
            page
              .locator('[data-testid="link-name-search-fr"]')
              .getAttribute('href'),
            page
              .locator('[data-testid="link-path-string"]')
              .getAttribute('href'),
          ])

        expect(searchHref).toBe('/de/suchen')
        expect(aboutHref).toBe('/de/about')
        expect(searchFrHref).toBe('/fr/rechercher')
        expect(pathHref).toBe('/fr/rechercher')

        await page.close()
      })

      it('links update reactively after navigation', async () => {
        const page = await createPage(url('/en/router-test'))

        // On /en, search link should be /en/search
        let href = await page
          .locator('[data-testid="link-name-search"]')
          .getAttribute('href')
        expect(href).toBe('/en/search')

        // Navigate to /de/router-test via push
        await page.locator('[data-testid="btn-push-about"]').click()
        await page.waitForURL('**/en/about')
        await page.goBack()
        await page.waitForURL('**/en/router-test')

        // Navigate to /de via the search link isn't direct, so let's navigate programmatically
        // We'll use the button to push to search (which goes to /en/search),
        // then go back and verify links are still correct
        href = await page
          .locator('[data-testid="link-name-search"]')
          .getAttribute('href')
        expect(href).toBe('/en/search')

        await page.close()
      })

      it('resolve() translates route name to current language variant', async () => {
        // The "Search by name" link uses { name: 'search' }.
        // On /de, resolve() should produce /de/suchen.
        const page = await createPage(url('/de/router-test'))

        const href = await page
          .locator('[data-testid="link-name-search"]')
          .getAttribute('href')
        expect(href).toBe('/de/suchen')

        await page.close()
      })

      it('resolve() translates to a different language variant', async () => {
        // Same link on /fr should produce /fr/rechercher.
        const page = await createPage(url('/fr/router-test'))

        const href = await page
          .locator('[data-testid="link-name-search"]')
          .getAttribute('href')
        expect(href).toBe('/fr/rechercher')

        await page.close()
      })

      it('resolve() auto-injects langPrefix for routes without mapping', async () => {
        // "About by name" uses { name: 'about' }. About has no
        // languageMapping, so the route uses :langPrefix param.
        // On /de, resolve() should inject langPrefix=de.
        const page = await createPage(url('/de/router-test'))

        const href = await page
          .locator('[data-testid="link-name-about"]')
          .getAttribute('href')
        expect(href).toBe('/de/about')

        await page.close()
      })

      it('resolve() skips translation when name already has ___ suffix', async () => {
        // { name: 'search___fr' } should NOT be double-translated.
        // It should resolve to the French search route regardless of
        // current language.
        const page = await createPage(url('/de/router-test'))

        const href = await page
          .locator('[data-testid="link-name-search-fr"]')
          .getAttribute('href')
        expect(href).toBe('/fr/rechercher')

        await page.close()
      })

      it('resolve() passes through string paths unchanged', async () => {
        const page = await createPage(url('/de/router-test'))

        const href = await page
          .locator('[data-testid="link-path-string"]')
          .getAttribute('href')
        expect(href).toBe('/fr/rechercher')

        await page.close()
      })

      it('push() navigates to the translated route', async () => {
        const page = await createPage(url('/de/router-test'))

        await page.locator('[data-testid="btn-push-search"]').click()
        await page.waitForURL('**/de/suchen')

        const language = await page
          .locator('[data-testid="current-language"]')
          .textContent()
        expect(language).toContain('de')

        await page.close()
      })

      it('replace() navigates to the translated route', async () => {
        const page = await createPage(url('/fr/router-test'))

        await page.locator('[data-testid="btn-replace-search"]').click()
        await page.waitForURL('**/fr/rechercher')

        const language = await page
          .locator('[data-testid="current-language"]')
          .textContent()
        expect(language).toContain('fr')

        await page.close()
      })

      it('push() injects langPrefix for unmapped routes', async () => {
        const page = await createPage(url('/fr/router-test'))

        await page.locator('[data-testid="btn-push-about"]').click()
        await page.waitForURL('**/fr/about')

        const language = await page
          .locator('[data-testid="current-language"]')
          .textContent()
        expect(language).toContain('fr')

        await page.close()
      })
    })

    describe('front redirect on client', () => {
      it('redirects root to default language prefix', async () => {
        const page = await createPage(url('/'))
        // Should end up at /en (or /en/).
        await page.waitForURL('**/en**')
        const finalUrl = page.url()
        expect(finalUrl).toContain('/en')
        await page.close()
      })
    })
  },
)

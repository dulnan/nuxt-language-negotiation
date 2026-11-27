import { describe, it, expect, vi } from 'vitest'
import { logger } from '../../src/build/helpers'
import {
  PageExtender,
  type BuiltPage,
} from './../../src/negotiators/pathPrefix/PageExtender'

type PartialNuxtPage = {
  path: string
  name: string
  meta?: {
    languageMapping?: Record<string, string>
  }
  children?: PartialNuxtPage[]
}

describe('PageExtender', () => {
  // Helper function to create a table-like output of built pages
  function formatBuiltPages(builtPages: BuiltPage[]): string {
    // Find maximum widths for each column to keep alignment
    const originalNameWidth = Math.max(
      ...builtPages.map((p) => p.originalName.length),
    )
    const newNameWidth = Math.max(...builtPages.map((p) => p.newName.length))
    const langcodesWidth = Math.max(
      ...builtPages.map((p) => p.langcodes.join(',').length),
    )
    // Lines for each built route
    const lines = builtPages.map((p) => {
      const originalName = p.originalName.padEnd(originalNameWidth)
      const newName = p.newName.padEnd(newNameWidth)
      const langcodes = p.langcodes.join(',').padEnd(langcodesWidth)

      return `${originalName} | ${newName} | ${langcodes} | ${p.path}`
    })

    return '\n' + lines.join('\n')
  }

  function createExtender(overrides: object = {}): PageExtender {
    const mockHelper: any = {
      languages: [
        { code: 'en', prefix: 'en', label: 'English' },
        { code: 'de', prefix: 'de', label: 'Deutsch' },
        { code: 'fr', prefix: 'fr', label: 'Français' },
      ],
      defaultLanguage: { code: 'en', prefix: 'en', label: 'English' },
      defaultLanguageNoPrefix: false,
      debug: false,
      ...overrides,
    }
    return new PageExtender(mockHelper)
  }

  function testExtend(
    pages: PartialNuxtPage[],
    overrides: object = {},
  ): string {
    const extender = createExtender(overrides)
    extender.extend(pages)
    const builtPages = extender.getBuiltPages()
    return formatBuiltPages(builtPages)
  }

  describe('extend()', () => {
    it('skips a page without a name and reports an error', () => {
      // The error does not throw, so that the dev server keeps running. The
      // pathPrefix negotiator throws for production builds when hasError().
      const logError = vi.spyOn(logger, 'error').mockImplementation(() => {})
      const extender = createExtender()
      const pages = extender.extend([
        { path: '/some-path-without-name' } as any,
        { name: 'about', path: '/about' },
      ])
      expect(extender.hasError()).toBe(true)
      expect(pages.map((v) => v.name)).toEqual(['about'])
      expect(logError).toHaveBeenCalledWith(
        expect.stringMatching(
          /Missing name in page "\/some-path-without-name"/,
        ),
      )
      logError.mockRestore()
    })

    it('handles a simple route without languageMapping (top-level)', () => {
      expect(testExtend([{ name: 'about', path: '/about' }]))
        .toMatchInlineSnapshot(`
          "
          about | about | en,de,fr | /:langPrefix(en|de|fr)/about"
        `)
    })

    it('handles multiple top-level routes without languageMapping', () => {
      expect(
        testExtend([
          { name: 'home', path: '' },
          { name: 'contact', path: '/contact' },
          { name: 'about', path: '/about' },
        ]),
      ).toMatchInlineSnapshot(`
        "
        home    | home    | en,de,fr | /:langPrefix(en|de|fr)
        contact | contact | en,de,fr | /:langPrefix(en|de|fr)/contact
        about   | about   | en,de,fr | /:langPrefix(en|de|fr)/about"
      `)
    })

    it('handles a top-level route with partial languageMapping', () => {
      expect(
        testExtend([
          {
            name: 'product',
            path: '/product',
            meta: {
              languageMapping: {
                // 'en' not specified, so it should default to the original path
                de: '/produkt',
                fr: '/produit',
              },
            },
          },
        ]),
      ).toMatchInlineSnapshot(`
        "
        product | product___fr | fr | /fr/produit
        product | product___en | en | /en/product
        product | product___de | de | /de/produkt"
      `)
    })

    it('handles a route with fully defined languageMapping', () => {
      expect(
        testExtend([
          {
            name: 'services',
            path: '/services',
            meta: {
              languageMapping: {
                en: '/services',
                de: '/dienstleistungen',
                fr: '/services-fr', // just an example
              },
            },
          },
        ]),
      ).toMatchInlineSnapshot(`
        "
        services | services___fr | fr | /fr/services-fr
        services | services___en | en | /en/services
        services | services___de | de | /de/dienstleistungen"
      `)
    })

    it('handles a route with catch-all path at top-level', () => {
      expect(testExtend([{ name: 'catchAll', path: '/:fallback(.*)*' }]))
        .toMatchInlineSnapshot(`
          "
          catchAll | catchAll | en,de,fr | /:fallback(.*)*"
        `)
    })

    it('handles nested routes (multiple levels deep)', () => {
      expect(
        testExtend([
          {
            name: 'parent',
            path: '/parent',
            children: [
              {
                name: 'child',
                path: 'child',
                children: [
                  {
                    name: 'grandchild',
                    path: 'grandchild',
                    children: [
                      {
                        name: 'greatgrandchild',
                        path: 'greatgrandchild',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ]),
      ).toMatchInlineSnapshot(`
        "
        parent          | parent          | en,de,fr | /:langPrefix(en|de|fr)/parent
        greatgrandchild | greatgrandchild | en,de,fr | /:langPrefix(en|de|fr)/parent/child/grandchild/greatgrandchild
        grandchild      | grandchild      | en,de,fr | /:langPrefix(en|de|fr)/parent/child/grandchild
        child           | child           | en,de,fr | /:langPrefix(en|de|fr)/parent/child"
      `)
    })

    it('handles param-based paths (e.g. /products/:id)', () => {
      expect(
        testExtend([
          {
            name: 'productDetail',
            path: '/products/:id',
          },
          {
            name: 'productCategory',
            path: '/products/:category(keyboard|mouse|cable)',
          },
        ]),
      ).toMatchInlineSnapshot(`
        "
        productDetail   | productDetail   | en,de,fr | /:langPrefix(en|de|fr)/products/:id
        productCategory | productCategory | en,de,fr | /:langPrefix(en|de|fr)/products/:category(keyboard|mouse|cable)"
      `)

      expect(
        testExtend([
          {
            name: 'productDetail',
            path: '/products/:id',
            children: [
              {
                name: 'productCategory',
                path: 'category/:category(keyboard|mouse|cable)',
                meta: {
                  languageMapping: {
                    de: 'kategorie/:category(keyboard|mouse|cable)',
                    fr: 'categorie/:category(clavier|souris|cable)',
                  },
                },
              },
            ],
          },
        ]),
      ).toMatchInlineSnapshot(`
        "
        productDetail   | productDetail        | en,de,fr | /:langPrefix(en|de|fr)/products/:id
        productCategory | productCategory___fr | fr       | /fr/products/:id/categorie/:category(clavier|souris|cable)
        productCategory | productCategory___en | en       | /en/products/:id/category/:category(keyboard|mouse|cable)
        productCategory | productCategory___de | de       | /de/products/:id/kategorie/:category(keyboard|mouse|cable)"
      `)
    })

    describe('default language without a prefix', () => {
      const noPrefix = {
        languages: [
          { code: 'en', prefix: '', label: 'English' },
          { code: 'de', prefix: 'de', label: 'Deutsch' },
          { code: 'fr', prefix: 'fr', label: 'Français' },
        ],
        defaultLanguage: { code: 'en', prefix: '', label: 'English' },
        defaultLanguageNoPrefix: true,
      }

      it('makes the language param optional without the default language', () => {
        expect(testExtend([{ name: 'about', path: '/about' }], noPrefix))
          .toMatchInlineSnapshot(`
            "
            about | about | en,de,fr | /:langPrefix(de|fr)?/about"
          `)
      })

      it('gives the default language route no prefix', () => {
        expect(
          testExtend(
            [
              {
                name: 'search',
                path: '/search',
                meta: { languageMapping: { de: '/suchen', fr: '/rechercher' } },
              },
            ],
            noPrefix,
          ),
        ).toMatchInlineSnapshot(`
          "
          search | search___fr | fr | /fr/rechercher
          search | search___en | en | /search
          search | search___de | de | /de/suchen"
        `)
      })

      it('links a page with a param with an empty prefix for the default language', () => {
        const extender = createExtender(noPrefix)
        extender.extend([{ name: 'node-id', path: '/node/:id' }])
        expect(extender.getLanguageLinks()).toEqual({
          'node-id': {
            en: { name: 'node-id', params: { langPrefix: '' } },
            de: { name: 'node-id', params: { langPrefix: 'de' } },
            fr: { name: 'node-id', params: { langPrefix: 'fr' } },
          },
        })
      })

      it('links the default language without a prefix', () => {
        const extender = createExtender(noPrefix)
        extender.extend([
          { name: 'about', path: '/about' },
          {
            name: 'search',
            path: '/search',
            meta: { languageMapping: { de: '/suchen' } },
          },
        ])
        expect(extender.getLanguageLinks()).toEqual({
          about: { en: '/about', de: '/de/about', fr: '/fr/about' },
          search: { en: '/search', de: '/de/suchen' },
        })
      })
    })

    it('skips a page whose path starts with a language prefix', () => {
      const logError = vi.spyOn(logger, 'error').mockImplementation(() => {})
      const extender = createExtender()
      const pages = extender.extend([
        { name: 'german', path: '/de/something' },
        { name: 'about', path: '/about' },
      ])
      expect(extender.hasError()).toBe(true)
      expect(pages.map((v) => v.name)).toEqual(['about'])
      expect(logError).toHaveBeenCalledWith(
        expect.stringContaining('"/de/something" is not valid'),
      )
      logError.mockRestore()
    })

    it('keeps only the default language for an empty languageMapping', () => {
      expect(
        testExtend([
          {
            name: 'only-english',
            path: '/only',
            meta: { languageMapping: {} },
          },
        ]),
      ).toMatchInlineSnapshot(`
        "
        only-english | only-english | en | /en/only"
      `)
    })

    it('links every language for a page without a mapping', () => {
      const extender = createExtender()
      extender.extend([{ name: 'about', path: '/about' }])
      expect(extender.getLanguageLinks()).toEqual({
        about: { en: '/en/about', de: '/de/about', fr: '/fr/about' },
      })
    })

    it('links every language of a page with a param by its prefix', () => {
      const extender = createExtender()
      extender.extend([{ name: 'node-id', path: '/node/:id' }])
      expect(extender.getLanguageLinks()).toEqual({
        'node-id': {
          en: { name: 'node-id', params: { langPrefix: 'en' } },
          de: { name: 'node-id', params: { langPrefix: 'de' } },
          fr: { name: 'node-id', params: { langPrefix: 'fr' } },
        },
      })
    })

    it('links a translated page with a param by its name', () => {
      const extender = createExtender()
      extender.extend([
        {
          name: 'product',
          path: '/product/:id',
          meta: { languageMapping: { de: '/produkt/:id' } },
        },
      ])
      expect(extender.getLanguageLinks()).toEqual({
        product: {
          en: { name: 'product___en' },
          de: { name: 'product___de' },
        },
      })
    })

    it('links the mapped paths of a page with a mapping', () => {
      const extender = createExtender()
      extender.extend([
        {
          name: 'search',
          path: '/search',
          meta: { languageMapping: { de: '/suchen' } },
        },
      ])
      expect(extender.getLanguageLinks()).toEqual({
        search: { en: '/en/search', de: '/de/suchen' },
      })
    })

    // Known issue: the language links of a child page without a mapping, in a
    // parent without a mapping, leave out the parent path
    // (PageExtender.ts getFullPagePath(page.path, '')).
    it.fails('links the full path of a nested page without a mapping', () => {
      const extender = createExtender()
      extender.extend([
        {
          name: 'parent',
          path: '/parent',
          children: [{ name: 'child', path: 'child' }],
        },
      ])
      expect(extender.getLanguageLinks().child).toEqual({
        en: '/en/parent/child',
        de: '/de/parent/child',
        fr: '/fr/parent/child',
      })
    })
  })
})

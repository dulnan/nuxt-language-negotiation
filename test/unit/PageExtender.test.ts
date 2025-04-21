import { describe, it, expect } from 'vitest'
import {
  PageExtender,
  type BuiltPage,
} from './../../src/negotiators/pathPrefix/PageExtender'
import { ModuleOptionsLanguages } from '../../src/build/types'

type PartialNuxtPage = {
  path: string
  name: string
  meta?: {
    languageMapping?: Record<string, string>
  }
  children?: PartialNuxtPage[]
}

type MockHelper = {
  languages: ModuleOptionsLanguages
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

  function testExtend(
    pages: PartialNuxtPage[],
    overrides: object = {},
  ): string {
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
    const extender = new PageExtender(mockHelper)
    extender.extend(pages)
    const builtPages = extender.getBuiltPages()
    return formatBuiltPages(builtPages)
  }

  describe('extend()', () => {
    it('throws an error if a page is missing a name', () => {
      expect(() =>
        testExtend([
          {
            path: '/some-path-without-name',
          } as any,
        ]),
      ).toThrowError(/Missing name in page/)
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

    it('handles scenario where defaultLanguageNoPrefix = true', () => {})
  })
})

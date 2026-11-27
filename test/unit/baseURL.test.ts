import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  withBaseURL,
  withoutBaseURL,
} from '../../src/runtime/server/helpers/negotiate'

const config = vi.hoisted(() => ({ baseURL: '/shop/' }))

vi.mock('#nuxt-language-negotiation/config', async (importOriginal) => {
  const original = await importOriginal<object>()
  return {
    ...original,
    get baseURL() {
      return config.baseURL
    },
  }
})

/**
 * A web-standard request event (Nitro v3) for the given request URL.
 */
function portableEvent(url: string) {
  const fullUrl = new URL(url, 'http://localhost')
  return { url: fullUrl, req: new Request(fullUrl) } as any
}

describe('withoutBaseURL', () => {
  it.each([
    ['/shop/fr', '/shop/', '/fr'],
    ['/shop/fr', '/shop', '/fr'],
    ['/shop/', '/shop/', '/'],
    ['/shop', '/shop/', '/'],
    ['/shop/__nuxt_error', '/shop/', '/__nuxt_error'],
    // Not the base, only starts with the same characters.
    ['/shopping/fr', '/shop/', '/shopping/fr'],
    // Without the base.
    ['/fr', '/shop/', '/fr'],
    // Removed once.
    ['/de/de/suchen', '/de/', '/de/suchen'],
    ['/de/fr', '/de/', '/fr'],
    // No base.
    ['/fr', '/', '/fr'],
    ['/', '/', '/'],
  ])('%s without %s is %s', (path, base, expected) => {
    expect(withoutBaseURL(path, base)).toBe(expected)
  })
})

describe('withBaseURL', () => {
  it.each([
    ['fr', '/shop/', '/shop/fr'],
    ['fr', '/shop', '/shop/fr'],
    ['fr', '/', '/fr'],
    ['', '/shop/', '/shop/'],
  ])('%s with %s is %s', (path, base, expected) => {
    expect(withBaseURL(path, base)).toBe(expected)
  })
})

describe('portable pathPrefix negotiator with a base URL', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  async function negotiate(baseURL: string, url: string) {
    config.baseURL = baseURL
    const { default: pathPrefix } =
      await import('../../src/runtime/server/negotiator/pathPrefix.portable')
    return pathPrefix({}).negotiate(portableEvent(url))
  }

  it.each([
    ['/shop/', '/shop/fr', 'fr'],
    ['/shop/', '/shop/fr/foo?x=1', 'fr'],
    ['/shop/', '/shop/', undefined],
    ['/shop/', '/shop/__nuxt_error?url=/fr/missing', 'fr'],
    ['/de/', '/de/fr', 'fr'],
    ['/de/', '/de/de/suchen', 'de'],
    ['/de/', '/de/', undefined],
    // The url query of the error page is relative to the base already.
    ['/de/', '/de/__nuxt_error?url=/fr/missing', 'fr'],
    ['/de/', '/de/__nuxt_error?url=/de/missing', 'de'],
  ])('base %s: %s -> %s', async (baseURL, url, expected) => {
    expect(await negotiate(baseURL, url)).toBe(expected)
  })
})

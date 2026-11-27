import { describe, it, expect } from 'vitest'
import { createEvent } from 'h3'
import pathPrefix from '../../src/runtime/server/negotiator/pathPrefix'
import pathPrefixPortable from '../../src/runtime/server/negotiator/pathPrefix.portable'
import query from '../../src/runtime/server/negotiator/query'
import queryPortable from '../../src/runtime/server/negotiator/query.portable'

/**
 * An h3 v1 event (Nitro v2) for the given request URL.
 */
function h3Event(url: string) {
  return createEvent({ url, method: 'GET', headers: {} } as any, {} as any)
}

/**
 * A web-standard request event (Nitro v3) for the given request URL.
 */
function portableEvent(url: string) {
  const fullUrl = new URL(url, 'http://localhost')
  return { url: fullUrl, req: new Request(fullUrl) } as any
}

describe('server negotiators', () => {
  describe('pathPrefix', () => {
    const cases: [string, string | undefined][] = [
      ['/fr', 'fr'],
      ['/fr/', 'fr'],
      ['/fr/foo', 'fr'],
      ['/fr/foo?utm=1', 'fr'],
      ['/fr?utm=1', 'fr'],
      ['/xx', undefined],
      ['/xx?lang=fr', undefined],
      ['/', undefined],
      ['/?utm=1', undefined],
      ['/__nuxt_error?url=/fr/missing', 'fr'],
      ['/__nuxt_error?url=' + encodeURIComponent('/fr/missing?x=1'), 'fr'],
      ['/__nuxt_error?url=' + encodeURIComponent('/fr?x=1'), 'fr'],
      ['/__nuxt_error?url=' + encodeURIComponent('/fr#top'), 'fr'],
    ]

    it.each(cases)('h3: %s -> %s', (url, expected) => {
      expect(pathPrefix({}).negotiate(h3Event(url))).toBe(expected)
    })

    it.each(cases)('portable: %s -> %s', (url, expected) => {
      expect(pathPrefixPortable({}).negotiate(portableEvent(url))).toBe(
        expected,
      )
    })
  })

  describe('query', () => {
    const keys = ['language', 'lang']
    const cases: [string, string | undefined][] = [
      ['/?language=fr', 'fr'],
      ['/?lang=fr', 'fr'],
      ['/?language=xx&lang=fr', 'fr'],
      ['/?language=xx', undefined],
      ['/', undefined],
      // A repeated key gives an array, which is not a valid language.
      ['/?language=xx&language=fr', undefined],
      ['/?language=fr&language=fr&lang=en', 'en'],
    ]

    it.each(cases)('h3: %s -> %s', (url, expected) => {
      expect(query({ keys }).negotiate(h3Event(url))).toBe(expected)
    })

    it.each(cases)('portable: %s -> %s', (url, expected) => {
      expect(queryPortable({ keys }).negotiate(portableEvent(url))).toBe(
        expected,
      )
    })
  })
})

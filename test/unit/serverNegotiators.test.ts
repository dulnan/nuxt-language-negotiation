import { describe, it, expect } from 'vitest'
import { createEvent } from 'h3'
import pathPrefix from '../../src/runtime/server/negotiator/pathPrefix'
import pathPrefixPortable from '../../src/runtime/server/negotiator/pathPrefix.portable'
import query from '../../src/runtime/server/negotiator/query'
import queryPortable from '../../src/runtime/server/negotiator/query.portable'
import cookie from '../../src/runtime/server/negotiator/cookie'
import cookiePortable from '../../src/runtime/server/negotiator/cookie.portable'
import acceptLanguage from '../../src/runtime/server/negotiator/acceptLanguage'
import acceptLanguagePortable from '../../src/runtime/server/negotiator/acceptLanguage.portable'

/**
 * An h3 v1 event (Nitro v2) for the given request URL.
 */
function h3Event(url: string, headers: Record<string, string> = {}) {
  return createEvent({ url, method: 'GET', headers } as any, {} as any)
}

/**
 * A web-standard request event (Nitro v3) for the given request URL.
 */
function portableEvent(url: string, headers: Record<string, string> = {}) {
  const fullUrl = new URL(url, 'http://localhost')
  return { url: fullUrl, req: new Request(fullUrl, { headers }) } as any
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
  describe('cookie', () => {
    const cases: [string, Record<string, string>, string | undefined][] = [
      ['default name', { cookie: 'negotiatedLanguage=fr' }, 'fr'],
      [
        'default name among others',
        { cookie: 'a=1; negotiatedLanguage=en; b=2' },
        'en',
      ],
      ['no cookie', {}, undefined],
      ['another cookie', { cookie: 'lang=fr' }, undefined],
    ]

    it.each(cases)('h3: %s', (_, headers, expected) => {
      expect(cookie({}).negotiate(h3Event('/', headers))).toBe(expected)
    })

    it.each(cases)('portable: %s', (_, headers, expected) => {
      expect(cookiePortable({}).negotiate(portableEvent('/', headers))).toBe(
        expected,
      )
    })

    it.each([
      [
        'h3',
        () =>
          cookie({ cookieName: 'lang' }).negotiate(
            h3Event('/', { cookie: 'negotiatedLanguage=en; lang=fr' }),
          ),
      ],
      [
        'portable',
        () =>
          cookiePortable({ cookieName: 'lang' }).negotiate(
            portableEvent('/', { cookie: 'negotiatedLanguage=en; lang=fr' }),
          ),
      ],
    ])('%s: reads a custom cookie name', (_, negotiate) => {
      expect(negotiate()).toBe('fr')
    })
  })

  describe('acceptLanguage', () => {
    const cases: [string, string | undefined][] = [
      ['fr', 'fr'],
      ['fr-CH, fr;q=0.9, en;q=0.8', 'fr'],
      ['it, en;q=0.8, fr;q=0.9', 'fr'],
      ['*', undefined],
      ['it', undefined],
      ['', undefined],
    ]

    it.each(cases)('h3: %j -> %s', (header, expected) => {
      const headers: Record<string, string> = header
        ? { 'accept-language': header }
        : {}
      expect(acceptLanguage({}).negotiate(h3Event('/', headers))).toBe(expected)
    })

    it.each(cases)('portable: %j -> %s', (header, expected) => {
      const headers: Record<string, string> = header
        ? { 'accept-language': header }
        : {}
      expect(
        acceptLanguagePortable({}).negotiate(portableEvent('/', headers)),
      ).toBe(expected)
    })
  })
})

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NuxtConfig } from 'nuxt/schema'
import type { ConsoleMessage, Page } from 'playwright-core'
import { it } from 'vitest'
import {
  createPage,
  fetch,
  setup,
  url,
  useTestContext,
} from '@nuxt/test-utils/e2e'

export type NitroMajor = 2 | 3

/**
 * A test for the correct behavior, which fails because of a known issue. It
 * passes while the issue exists, and fails once it is fixed: then change it to
 * it(). With KNOWN_ISSUES=strict, these run as normal tests, to see why they
 * fail.
 */
export const knownIssue = process.env.KNOWN_ISSUES === 'strict' ? it : it.fails

/**
 * What the TestState component renders.
 */
export type State = {
  language: string
  fullLanguage: { code: string; prefix: string; label: string }
  routeName: string | null
  routePath: string
  statusCode: number | null
  links: {
    code: string
    enabled: boolean
    active: boolean
    href: string | null
    resolveError: string | null
  }[]
  hydrated: boolean
}

/**
 * Build and start a fixture app from test/e2e/fixtures on the given Nitro
 * major. Call it at the top level of a test file.
 */
export function setupFixture(
  name: string,
  nitro: NitroMajor,
  nuxtConfig: NuxtConfig = {},
) {
  return setup({
    rootDir: fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)),
    browser: true,
    setupTimeout: 300_000,
    nuxtConfig: {
      ...nuxtConfig,
      // Pick the Nitro major explicitly. Otherwise Nuxt detects it from the
      // dependencies, and the repo declares both.
      _nitroMajor: nitro,
    } as NuxtConfig,
  })
}

/**
 * The Nitro version the fixture was built with.
 */
export async function getBuiltNitroVersion(): Promise<string> {
  const outputDir = useTestContext().nuxt!.options.nitro.output!.dir!
  const json = JSON.parse(await readFile(join(outputDir, 'nitro.json'), 'utf8'))
  return json.versions.nitro
}

const ENTITIES: Record<string, string> = {
  '&quot;': '"',
  '&#39;': "'",
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
}

/**
 * Read the state the TestState component rendered into the HTML.
 */
export function readState(html: string): State | null {
  const match = /<pre data-testid="state">([\s\S]*?)<\/pre>/.exec(html)
  if (!match) {
    return null
  }
  const json = match[1]!.replace(/&(quot|#39|lt|gt|amp);/g, (v) => ENTITIES[v]!)
  return JSON.parse(json)
}

/**
 * Read the href of the link with the given data-testid from the HTML.
 */
export function readLinkHref(html: string, testId: string): string | null {
  const tag = new RegExp(`<a [^>]*data-testid="${testId}"[^>]*>`).exec(html)
  return tag ? (/ href="([^"]*)"/.exec(tag[0])?.[1] ?? null) : null
}

export type RequestOptions = {
  acceptLanguage?: string
  cookie?: string
  headers?: Record<string, string>
}

/**
 * Request a page from the fixture server, without following redirects.
 */
export async function request(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    accept: 'text/html',
    ...options.headers,
  }
  if (options.acceptLanguage) {
    headers['accept-language'] = options.acceptLanguage
  }
  if (options.cookie) {
    headers.cookie = options.cookie
  }
  const response = await fetch(path, { headers, redirect: 'manual' })
  const body = await response.text()
  return {
    status: response.status,
    location: response.headers.get('location'),
    body,
    state: readState(body),
  }
}

/**
 * Request a page and return its state. Fails if the page has none.
 */
export async function getState(path: string, options: RequestOptions = {}) {
  const response = await request(path, options)
  if (!response.state) {
    throw new Error(
      `No state in the response for ${path} (status ${response.status}).`,
    )
  }
  return response.state
}

/**
 * Request an API route and return its JSON.
 */
export async function getJson<T = any>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await request(path, {
    ...options,
    headers: { accept: 'application/json', ...options.headers },
  })
  return JSON.parse(response.body)
}

/**
 * Collect the console errors and warnings of a page.
 */
export function collectConsole(page: Page): string[] {
  const messages: string[] = []
  page.on('console', (message: ConsoleMessage) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      messages.push(message.text())
    }
  })
  page.on('pageerror', (error) => {
    messages.push(error.message)
  })
  return messages
}

/**
 * Open a path in the browser and wait for hydration. Console errors and
 * warnings are collected from the start.
 */
export async function openPage(path: string, options: RequestOptions = {}) {
  const extraHTTPHeaders: Record<string, string> = { ...options.headers }
  if (options.acceptLanguage) {
    extraHTTPHeaders['accept-language'] = options.acceptLanguage
  }
  if (options.cookie) {
    extraHTTPHeaders.cookie = options.cookie
  }
  const page = await createPage(undefined, { extraHTTPHeaders })
  const messages = collectConsole(page)
  const response = await page.goto(url(path), { waitUntil: 'hydration' })
  return { page, messages, response }
}

/**
 * Read the state from the hydrated page.
 */
export async function readPageState(page: Page): Promise<State> {
  const locator = page.locator('[data-testid="state"]')
  await page.waitForFunction(() => {
    const el = document.querySelector('[data-testid="state"]')
    return !!el && JSON.parse(el.textContent || '{}').hydrated === true
  })
  return JSON.parse((await locator.textContent()) || '')
}

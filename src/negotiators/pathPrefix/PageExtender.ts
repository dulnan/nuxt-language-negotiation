import type { NuxtPage } from 'nuxt/schema'
import type { ModuleHelper } from './../../build/classes/ModuleHelper'
import type { RouteLocationRaw } from 'vue-router'
import { cleanPagePath, getFullPagePath } from '../../build/helpers/pages'
import { logger } from '../../build/helpers'
import type { LanguageBase } from '../../runtime/types'

export type BuildLanguageLinks = {
  originalName: string
  language: string
  to: RouteLocationRaw
}

export type LanguageLinksMap = Record<string, Record<string, RouteLocationRaw>>

export type BuiltPage = {
  originalName: string
  newName: string
  path: string
  langcodes: string[]
}

// The regex to match a path that is used as a "catch all" route.
const CATCH_ALL_REGEX = /^\/:([A-Za-z0-9]+)\(\.\*\)\*$/

export class PageExtender {
  private readonly languageLinks: BuildLanguageLinks[] = []
  private readonly allLangcodes: string[]
  private languageParam: string
  private builtPages: BuiltPage[] = []

  constructor(private helper: ModuleHelper) {
    const nonDefaultLanguages = helper.languages.filter(
      (v) => v.code !== this.helper.defaultLanguage.code,
    )
    this.allLangcodes = helper.languages.map((v) => v.code)

    // If the default language has no prefix, we need to adjust the param:
    // The default language is removed from the possible param values and
    // the entire param is optional.
    this.languageParam = this.helper.defaultLanguageNoPrefix
      ? `:langPrefix(${nonDefaultLanguages.map((v) => v.prefix).join('|')})?`
      : `:langPrefix(${helper.languages.map((v) => v.prefix).join('|')})`
  }

  public extend(
    pages: NuxtPage[],
    parentPath = '',
    onlyLanguage?: LanguageBase,
  ): NuxtPage[] {
    const extended: NuxtPage[] = []

    for (const page of pages) {
      const originalName = page.name
      if (!originalName) {
        throw new Error(
          `Missing name in page "${page.path}". ` +
            'nuxt-language-negotiation requires every page to have a name.',
        )
      }

      // Catch all.
      if (!parentPath && page.path.match(CATCH_ALL_REGEX)) {
        extended.push(page)
        this.addBuiltPage(page.path, this.allLangcodes, originalName)
        continue
      }

      // Route without any language mapping.
      const mapping = page.meta?.languageMapping as
        | Record<string, string>
        | undefined

      if (!mapping) {
        if (onlyLanguage) {
          // We are inside a language‑specific tree (parent already translated).
          const relative = getFullPagePath(page.path, parentPath)
          const absPath = cleanPagePath(
            onlyLanguage.code === this.helper.defaultLanguage.code &&
              this.helper.defaultLanguageNoPrefix
              ? `/${relative}`
              : `/${onlyLanguage.prefix}/${relative}`,
          )
          const translatedName = `${page.name}___${onlyLanguage.code}`

          this.addLanguageLink(
            onlyLanguage,
            originalName,
            translatedName,
            absPath,
          )

          extended.push({
            ...page,
            name: translatedName,
            path: absPath,
            children: page.children
              ? this.extend(page.children, relative, onlyLanguage)
              : undefined,
            meta: { ...(page.meta || {}), originalName: page.name },
          })
          this.addBuiltPage(
            absPath,
            [onlyLanguage.code],
            originalName,
            translatedName,
          )
          continue
        }

        // Top level with language param.
        const shared = cleanPagePath(
          `/${this.languageParam}${getFullPagePath(page.path, parentPath)}`,
        )

        for (const lang of this.helper.languages) {
          const linkPath =
            lang.code === this.helper.defaultLanguage.code &&
            this.helper.defaultLanguageNoPrefix
              ? cleanPagePath(`/${getFullPagePath(page.path, '')}`)
              : cleanPagePath(
                  `/${lang.prefix}${getFullPagePath(page.path, '')}`,
                )

          this.addLanguageLink(lang, originalName, originalName, linkPath)
        }

        extended.push({
          ...page,
          path: shared,
          children: page.children
            ? this.extend(page.children, getFullPagePath(page.path, parentPath))
            : undefined,
          meta: { ...(page.meta || {}), originalName: page.name },
        })
        this.addBuiltPage(shared, this.allLangcodes, originalName)
        continue
      }

      // Route with language mapping.
      const mappedLangcodes = Object.keys(mapping)
      const mappingIsEmpty = mappedLangcodes.length === 0
      const langsToProcess = mappingIsEmpty
        ? [this.helper.defaultLanguage]
        : this.helper.languages.filter(
            (language) =>
              mappedLangcodes.includes(language.code) ||
              language.code === this.helper.defaultLanguage.code,
          )

      for (const lang of langsToProcess) {
        if (onlyLanguage && lang.code !== onlyLanguage.code) continue
        if (mappingIsEmpty && lang.code !== this.helper.defaultLanguage.code)
          continue

        const segment = mapping[lang.code] ?? page.path
        const relative = getFullPagePath(segment, parentPath)
        const absPath = cleanPagePath(
          lang.code === this.helper.defaultLanguage.code &&
            this.helper.defaultLanguageNoPrefix
            ? `/${relative}`
            : `/${lang.prefix}/${relative}`,
        )
        const routeName = mappingIsEmpty
          ? originalName
          : `${page.name}___${lang.code}`

        this.addLanguageLink(lang, originalName, routeName, absPath)

        extended.push({
          ...page,
          name: routeName,
          path: absPath,
          children: page.children
            ? this.extend(page.children, relative, lang)
            : undefined,
          meta: {
            ...(page.meta || {}),
            languageMapping: undefined,
            originalName,
          },
        })
        this.addBuiltPage(absPath, [lang.code], originalName, routeName)
      }
    }

    return extended
  }

  private addBuiltPage(
    path: string,
    langcodes: string[],
    originalName: string,
    newName?: string,
  ) {
    this.builtPages.push({
      originalName,
      newName: newName || originalName,
      path,
      langcodes,
    })
  }

  private addLanguageLink(
    language: LanguageBase,
    originalName: string,
    name: string,
    path: string,
  ) {
    const to = path.includes(':') ? { name } : path
    this.languageLinks.push({
      originalName,
      language: language.code,
      to,
    })
  }

  public getBuiltPages(): BuiltPage[] {
    return this.builtPages.sort((a, b) => b.newName.localeCompare(a.newName))
  }

  public logMessagesToConsole() {
    if (!this.helper.debug) {
      return
    }

    const longestName = this.builtPages.reduce((max, item) => {
      const name = item.newName
      if (name.length > max) {
        return name.length
      }

      return max
    }, 0)

    const messages = this.builtPages
      .map((page) => {
        return `${page.newName.padEnd(longestName + 1)} | ${page.path}`
      })
      .sort()

    messages.forEach((message) => {
      logger.log(message)
    })
  }

  public getLanguageLinks(): LanguageLinksMap {
    return this.languageLinks.reduce<LanguageLinksMap>((acc, cur) => {
      acc[cur.originalName] ||= {}
      acc[cur.originalName]![cur.language] = cur.to
      return acc
    }, {})
  }
}

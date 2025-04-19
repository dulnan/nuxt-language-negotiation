import { defineTemplate } from '../defineTemplate'

export default defineTemplate(
  {
    name: 'config',
  },
  (helper) => {
    const defaultLanguage =
      helper.options.defaultLanguage || helper.options.availableLanguages[0]
    return `
export const languages = ${JSON.stringify(helper.options.availableLanguages)}
export const queryStringKeys = ${JSON.stringify(helper.options.queryStringKeys)}
export const debug = ${JSON.stringify(helper.options.debug)}
export const prefixMapping = ${JSON.stringify(helper.options.prefixMapping || {})}
export const cookieName = ${JSON.stringify(helper.options.cookieName)}
export const defaultLanguageNoPrefix = ${JSON.stringify(helper.options.defaultLanguageNoPrefix)}
export const defaultLanguage = ${JSON.stringify(defaultLanguage)}
export const negotiators = ${JSON.stringify(helper.options.negotiators)}
`
  },
  (helper) => {
    const ValidLanguage = helper.options.availableLanguages
      .map((v) => `"${v}"`)
      .join(' | ')

    return `
import type { LanguageLinkBase } from '${helper.paths.runtimeTypes}'

declare module '#nuxt-language-negotiation/config' {
  export type ValidLanguage = ${ValidLanguage};
  export type LanguageLink = LanguageLinkBase<ValidLanguage>

  export const languages: ValidLanguage[];
  export const queryStringKeys: string[];
  export const debug: boolean;
  export const prefixMapping: Record<string, ValidLanguage>;
  export const cookieName: string;
  export const defaultLanguageNoPrefix: boolean;
  export const defaultLanguage: PageLanguage;
}
`
  },
)

import { defineTemplate } from '../defineTemplate'

export default defineTemplate(
  {
    name: 'config',
  },
  (helper) => {
    return `
export const langcodes = Object.freeze(${JSON.stringify(helper.languages.map((v) => v.code))});
export const languages = Object.freeze(${JSON.stringify(helper.languages, null, 2)});
export const debug = ${JSON.stringify(helper.debug)};
export const defaultLanguageNoPrefix = ${JSON.stringify(helper.defaultLanguageNoPrefix)};
export const defaultLangcode = ${JSON.stringify(helper.defaultLanguage.code)};
export const prefixToLangcode = Object.freeze(${JSON.stringify(helper.prefixToLangcode, null, 2)});
export const langcodeToPrefix = Object.freeze(${JSON.stringify(helper.langcodeToPrefix, null, 2)});
`
  },
  (helper) => {
    const Langcode = helper.languages.map((v) => `"${v.code}"`).join(' | ')

    return `
import type { LanguageLinkBase, LanguageBase } from '${helper.paths.runtimeTypes}'

declare module '#nuxt-language-negotiation/config' {
  /**
   * A valid language code.
   */
  export type Langcode = ${Langcode};

  /**
   * Langcodes that can be used for defining language mappings.
   */
  export type ValidMappingLangcode = Exclude<Langcode, '${helper.defaultLanguage.code}'>;

  /**
   * A valid language object.
   */
  export type Language = LanguageBase<Langcode>;

  /**
   * A language link.
   */
  export type LanguageLink = Language & LanguageLinkBase<Langcode>;

  /**
   * Array of valid language codes.
   */
  export const langcodes: Readonly<Langcode[]>;

  /**
   * All language objects.
   */
  export const languages: Readonly<Language[]>;

  /**
   * Whether debugging is enabled.
   */
  export const debug: boolean;

  /**
   * Whether the default language does not use a prefix.
   */
  export const defaultLanguageNoPrefix: boolean;

  /**
   * The default language code.
   */
  export const defaultLangcode: Langcode;

  /**
   * A map of language prefixes to langcodes.
   */
  export const prefixToLangcode: Readonly<Record<string, Langcode>>;

  /**
   * A map of language codes to prefixes.
   */
  export const langcodeToPrefix: Readonly<Record<Langcode, string>>;
}
`
  },
)

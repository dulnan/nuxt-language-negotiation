import {
  addImports,
  addPlugin,
  addServerHandler,
  addServerImports,
  addTemplate,
  addTypeTemplate,
  createResolver,
  type Resolver,
} from '@nuxt/kit'
import { relative } from 'pathe'
import type { Nuxt, NuxtPlugin, ResolvedNuxtTemplate } from 'nuxt/schema'
import type { LanguageBase } from './../../runtime/types'
import type { ModuleOptions, ModuleOptionsLanguages } from './../types'
import { defu } from 'defu'
import { fileExists, logger } from './../helpers'
import type { ModuleTemplate } from './../templates/defineTemplate'
import ISO6391 from 'iso-639-1'

/**
 * Validate and build the language options.
 */
function buildLanguageOptions(rawLanguages: ModuleOptionsLanguages): {
  languages: LanguageBase[]
  defaultLanguage: LanguageBase
  defaultLanguageNoPrefix: boolean
} {
  if (!rawLanguages || rawLanguages.length === 0) {
    throw new Error('At least one language is required.')
  }

  // Normalize to objects
  const mapped = rawLanguages.map((v) =>
    typeof v === 'string' ? { code: v } : { ...v },
  )

  // Enrich with label & prefix
  const languages: LanguageBase[] = mapped.map<LanguageBase>((lang) => {
    const { code } = lang
    if (!code) {
      throw new Error(`Language entry is missing a code.`)
    }

    if (!/^[A-Za-z_-]+$/.test(code)) {
      throw new Error(
        `Invalid language code "${code}". Only letters, underscore and hyphen are allowed.`,
      )
    }

    const prefix = lang.prefix ?? code
    if (!/^[A-Za-z_-]*$/.test(prefix)) {
      throw new Error(
        `Invalid prefix "${prefix}" for language "${code}". Only letters, underscore and hyphen are allowed.`,
      )
    }

    const label = lang.label || ISO6391.getNativeName(code)
    if (!label) {
      throw new Error(
        `Failed to determine label for language "${code}". Please provide a label.`,
      )
    }

    return { code, prefix, label }
  })

  // Check uniqueness of codes & prefixes
  const codes = languages.map((l) => l.code)
  const prefixes = languages.map((l) => l.prefix)
  const duplicateCodes = codes.filter((c, i) => codes.indexOf(c) !== i)
  const duplicatePrefixes = prefixes.filter((p, i) => prefixes.indexOf(p) !== i)
  if (duplicateCodes.length) {
    throw new Error(
      `Duplicate language codes found: ${[...new Set(duplicateCodes)].join(', ')}`,
    )
  }
  if (duplicatePrefixes.length) {
    throw new Error(
      `Duplicate language prefixes found: ${[
        ...new Set(duplicatePrefixes),
      ].join(', ')}`,
    )
  }

  const defaultLanguage = languages[0]!
  const defaultLanguageNoPrefix = defaultLanguage.prefix === ''

  return { languages, defaultLanguage, defaultLanguageNoPrefix }
}

type ModuleHelperResolvers = {
  /**
   * Resolver for paths relative to the module root.
   */
  module: Resolver

  /**
   * Resolve relative to the app's server directory.
   */
  server: Resolver

  /**
   * Resolve relative to the Nuxt src folder.
   */
  src: Resolver

  /**
   * Resolve relative to the Nuxt app directory.
   */
  app: Resolver

  /**
   * Resolve relative to the Nuxt root.
   *
   * Should be where nuxt.config.ts is located.
   */
  root: Resolver

  /**
   * Resolve relative to the workspace root.
   */
  workspace: Resolver
}

type ModuleHelperPaths = {
  runtimeTypes: string
  root: string
  nuxtConfig: string
  serverDir: string
  serverOptions: string | null
  moduleBuildDir: string
}

type ServerNegotiator = {
  name: string
  filePath: string
  options?: object
}

export class ModuleHelper {
  public readonly resolvers: ModuleHelperResolvers
  public readonly paths: ModuleHelperPaths

  public readonly isDev: boolean
  public readonly isPlaygroundDev: boolean
  public readonly debug: boolean

  private serverNegotiators: ServerNegotiator[] = []

  private nitroExternals: string[] = []
  private tsPaths: Record<string, string> = {}

  public readonly languages: LanguageBase[]
  public readonly defaultLanguage: LanguageBase
  public readonly defaultLanguageNoPrefix: boolean
  public readonly prefixToLangcode: Record<string, string>
  public readonly langcodeToPrefix: Record<string, string>

  constructor(
    public nuxt: Nuxt,
    moduleUrl: string,
    options: ModuleOptions,
  ) {
    const isModuleBuild =
      process.env.PLAYGROUND_MODULE_BUILD === 'true' && nuxt.options._prepare

    this.isPlaygroundDev = process.env.PLAYGROUND_DEV === 'true'

    const mergedOptions = defu(options)

    // When running dev:prepare during module development we have to "fake"
    // options to use the playground.
    if (isModuleBuild) {
      mergedOptions.languages = ['de', 'en', 'fr', 'it']
    }

    const { languages, defaultLanguage, defaultLanguageNoPrefix } =
      buildLanguageOptions(mergedOptions.languages)
    this.languages = languages
    this.defaultLanguage = defaultLanguage
    this.defaultLanguageNoPrefix = defaultLanguageNoPrefix

    this.debug = !!options.debug
    this.prefixToLangcode = Object.fromEntries(
      this.languages.map((v) => {
        return [v.prefix, v.code]
      }),
    )

    this.langcodeToPrefix = Object.fromEntries(
      this.languages.map((v) => {
        return [v.code, v.prefix]
      }),
    )

    // Resolver for the root directory.
    const srcResolver = createResolver(nuxt.options.srcDir)
    const rootResolver = createResolver(nuxt.options.rootDir)

    this.isDev = nuxt.options.dev
    this.resolvers = {
      module: createResolver(moduleUrl),
      server: createResolver(nuxt.options.serverDir),
      src: srcResolver,
      app: createResolver(nuxt.options.dir.app),
      root: rootResolver,
      workspace: createResolver(nuxt.options.workspaceDir),
    }

    this.paths = {
      runtimeTypes: '',
      root: nuxt.options.rootDir,
      nuxtConfig: this.resolvers.root.resolve('nuxt.config.ts'),
      serverDir: nuxt.options.serverDir,
      serverOptions: '',
      moduleBuildDir: nuxt.options.buildDir + '/nuxt-language-negotiation',
    }

    // This path needs to be built afterwards since the method we call
    // depends on a value of this.paths.
    this.paths.runtimeTypes = this.toModuleBuildRelative(
      this.resolvers.module.resolve('./runtime/types/index'),
    )

    this.paths.serverOptions = this.findServerOptions()
  }

  /**
   * Find the path to the languageNegotiation.serverOptions.ts file.
   */
  private findServerOptions(): string | null {
    // Look for the file in the server directory.
    const newPath = this.resolvers.server.resolve(
      'languageNegotiation.serverOptions',
    )
    const serverPath = fileExists(newPath)

    if (serverPath) {
      return serverPath
    }

    logger.info('No languageNegotiation.serverOptions file found.')
    return null
  }

  /**
   * Transform the path relative to the module's build directory.
   *
   * @param path - The absolute path.
   *
   * @returns The path relative to the module's build directory.
   */
  public toModuleBuildRelative(path: string): string {
    return relative(this.paths.moduleBuildDir, path)
  }

  /**
   * Transform the path relative to the Nuxt build directory.
   *
   * @param path - The absolute path.
   *
   * @returns The path relative to the module's build directory.
   */
  public toBuildRelative(path: string): string {
    return relative(this.nuxt.options.buildDir, path)
  }

  public addAlias(name: string, path: string) {
    this.nuxt.options.alias[name] = path

    // In our case, the name of the alias corresponds to a folder in the build
    // dir with the same name (minus the #).
    const pathFromName = `./${name.substring(1)}`

    this.tsPaths[name] = pathFromName
    this.tsPaths[name + '/*'] = pathFromName + '/*'

    // Add the alias as an external so that the nitro server build doesn't fail.
    this.inlineNitroExternals(name)
    this.inlineNitroExternals(path)
  }

  public inlineNitroExternals(arg: ResolvedNuxtTemplate | string) {
    const path = typeof arg === 'string' ? arg : arg.dst
    this.nitroExternals.push(path)
    this.transpile(path)
  }

  public transpile(path: string) {
    this.nuxt.options.build.transpile.push(path)
  }

  public applyBuildConfig() {
    // Workaround for https://github.com/nuxt/nuxt/issues/28995
    this.nuxt.options.nitro.externals ||= {}
    this.nuxt.options.nitro.externals.inline ||= []
    this.nuxt.options.nitro.externals.inline.push(...this.nitroExternals)

    // Currently needed due to a bug in Nuxt that does not add aliases for
    // nitro. As this has happened before in the past, let's leave it so that
    // we are guaranteed to have these aliases also for server types.
    this.nuxt.options.nitro.typescript ||= {}
    this.nuxt.options.nitro.typescript.tsConfig ||= {}
    this.nuxt.options.nitro.typescript.tsConfig.compilerOptions ||= {}
    this.nuxt.options.nitro.typescript.tsConfig.compilerOptions.paths ||= {}

    this.nuxt.options.typescript.tsConfig ||= {}
    this.nuxt.options.typescript.tsConfig.compilerOptions ||= {}
    this.nuxt.options.typescript.tsConfig.compilerOptions.paths ||= {}

    for (const [name, path] of Object.entries(this.tsPaths)) {
      this.nuxt.options.nitro.typescript.tsConfig.compilerOptions.paths[name] =
        [path]
      this.nuxt.options.typescript.tsConfig.compilerOptions.paths[name] = [path]
    }
  }

  public addTemplate(template: ModuleTemplate) {
    if (template.build) {
      const content = template.build(this)
      addTemplate({
        filename: 'nuxt-language-negotiation/' + template.options.name + '.js',
        write: true,
        getContents:
          typeof content === 'string' ? () => content.trim() : content,
      })
    }

    if (template.buildTypes) {
      const content = template.buildTypes(this).trim()
      const filename =
        `nuxt-language-negotiation/${template.options.name}.d.ts` as `${string}.d.ts`
      addTypeTemplate(
        {
          filename,
          write: true,
          getContents: () => content,
        },
        {
          nuxt: true,
          nitro: template.options.serverTypes,
        },
      )
    }
  }

  public addPlugin(name: string, mode: NuxtPlugin['mode'] = 'all') {
    addPlugin(
      {
        src: this.resolvers.module.resolve('./runtime/app/plugins/' + name),
        mode,
      },
      {
        append: false,
      },
    )
  }

  public addServerMiddleware(name: string) {
    addServerHandler({
      handler: this.resolvers.module.resolve(
        './runtime/server/middleware/' + name,
      ),
      middleware: true,
    })
  }

  public addComposable(name: string) {
    addImports({
      from: this.resolvers.module.resolve('./runtime/app/composables/' + name),
      name,
    })
  }

  public addServerUtil(name: string) {
    addServerImports([
      {
        from: this.resolvers.module.resolve('./runtime/server/utils/' + name),
        name,
      },
    ])
  }

  public addServerNegotiator(name: string, options: object = {}) {
    const filePath = this.resolvers.module.resolve(
      `./runtime/server/negotiator/${name}`,
    )
    this.serverNegotiators.push({
      name,
      filePath,
      options,
    })
  }

  public getServerNegotiators(): ServerNegotiator[] {
    return this.serverNegotiators
  }
}

import { toValidVariableName } from '../../helpers'
import { defineTemplate } from '../defineTemplate'
import { relative } from 'pathe'

export default defineTemplate(
  {
    name: 'server',
    serverTypes: true,
  },
  (helper) => {
    const resolvedPathRelative = helper.paths.serverOptions
      ? helper.toModuleBuildRelative(helper.paths.serverOptions)
      : null
    const serverOptionsLine = resolvedPathRelative
      ? `import serverOptions from '${resolvedPathRelative}'`
      : `const serverOptions = {}`

    const negotiators = helper.getServerNegotiators()

    const mapped = negotiators.map((negotiator) => {
      // When we are in dev mode in the module's playground we have to import the
      // actual ts file from the src folder. However once its built and in use,
      // we need to import the compiled js file.
      const suffix = helper.isPlaygroundDev ? '.ts' : '.js'
      const importPath =
        relative(helper.paths.moduleBuildDir, negotiator.filePath) + suffix
      const variableName = toValidVariableName(negotiator.name)

      const importLine = `import ${variableName} from '${importPath}'`
      const init = `${variableName}(${JSON.stringify(negotiator.options)})`
      return { importLine, init }
    })

    const imports = mapped.map((v) => v.importLine).join('\n')

    const inits = mapped.map((v) => v.init).join(',\n  ')

    return `
${imports}
${serverOptionsLine}

export const negotiators = [
  ${inits}
]

export { serverOptions }
`
  },
  (helper) => {
    return `
import type { ServerOptions, ServerNegotiator } from '${helper.paths.runtimeTypes}'
import type { Langcode } from '#nuxt-language-negotiation/config'

declare module '#nuxt-language-negotiation/server' {
  /**
   * The user-provided server options.
   */
  export const serverOptions: ServerOptions<Langcode>

  /**
   * The available server negotiator instances.
   */
  export const negotiators: ServerNegotiator[]
}
`
  },
)

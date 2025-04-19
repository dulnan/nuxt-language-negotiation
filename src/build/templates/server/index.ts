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
      const importPath = relative(
        helper.paths.moduleBuildDir,
        negotiator.filePath,
      )
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

export { serverOptions }

export const negotiators = [
  ${inits}
]
`
  },
  (helper) => {
    return `
import type { ServerOptions, ServerNegotiator } from '${helper.paths.runtimeTypes}'
import type { ValidLanguage } from '#nuxt-language-negotiation/config'

declare module '#nuxt-language-negotiation/server' {
  export const serverOptions: ServerOptions<ValidLanguage>
  export const negotiators: ServerNegotiator[]
}
`
  },
)

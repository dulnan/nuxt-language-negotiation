import type { ModuleHelper } from '../classes/ModuleHelper'

export type ModuleTemplateInit = (helper: ModuleHelper) => ModuleTemplate

export type ModuleTemplateOptions = {
  name: string
  serverTypes?: boolean
}

export type ModuleTemplate = {
  options: ModuleTemplateOptions
  build: (helper: ModuleHelper) => string | (() => string)
  buildTypes: (helper: ModuleHelper) => string
}

export function defineTemplate(
  options: ModuleTemplateOptions,
  build: (helper: ModuleHelper) => string,
  buildTypes: (helper: ModuleHelper) => string,
): ModuleTemplate {
  return { options, build, buildTypes }
}

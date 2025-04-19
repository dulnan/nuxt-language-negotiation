export type NuxtLanguageNegotiationServerOptions = {
  negotiate: () => string
}

export function defineLanguageServerOptions(
  options: NuxtLanguageNegotiationServerOptions,
): NuxtLanguageNegotiationServerOptions {
  return options
}

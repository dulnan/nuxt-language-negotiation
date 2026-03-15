<template>
  <slot :langcode="overrideLanguage" />
</template>

<script setup lang="ts">
/**
 * Override the current language for all components rendered in the default slot.
 *
 * Whenever a component down the tree uses useCurrentLanguage, it will receive
 * the provided override language. NuxtLink / RouterLink in the subtree will
 * also resolve routes using the override language.
 */
import { computed, provide, inject } from '#imports'
import type { RouteLocationRaw } from 'vue-router'
import { routerKey } from 'vue-router'
import type { Langcode } from '#nuxt-language-negotiation/config'
import { toValidLanguage } from '../../helpers/toValidLanguage'
import {
  INJECT_OVERRIDE_LANGUAGE,
  INJECT_LANGUAGE_ROUTER_CONTEXT,
} from '../helpers/injection'
import { translateLocation } from '../helpers/translateLocation'

const props = defineProps<{
  langcode: string | null
}>()

defineSlots<{
  default(props: { langcode: Langcode | null }): any
}>()

const overrideLanguage = computed<Langcode | null>(() => {
  if (props.langcode) {
    return toValidLanguage(props.langcode)
  }

  return null
})

provide(INJECT_OVERRIDE_LANGUAGE, overrideLanguage)

// Provide a wrapped router for NuxtLink/RouterLink in the subtree.
// When an override language is active, resolve/push/replace will use
// the override language instead of the route language.
const routerContext = inject(INJECT_LANGUAGE_ROUTER_CONTEXT, null)
if (routerContext) {
  const router = inject(routerKey)!
  const wrappedRouter = new Proxy(router, {
    get(target, prop) {
      if (prop === 'resolve') {
        return (to: RouteLocationRaw, currentLocation?: any) => {
          if (overrideLanguage.value) {
            return routerContext.resolve(
              translateLocation(to, overrideLanguage.value),
              currentLocation,
            )
          }
          return target.resolve(to, currentLocation)
        }
      }
      if (prop === 'push') {
        return (to: RouteLocationRaw) => {
          if (overrideLanguage.value) {
            return routerContext.push(
              translateLocation(to, overrideLanguage.value),
            )
          }
          return target.push(to)
        }
      }
      if (prop === 'replace') {
        return (to: RouteLocationRaw) => {
          if (overrideLanguage.value) {
            return routerContext.replace(
              translateLocation(to, overrideLanguage.value),
            )
          }
          return target.replace(to)
        }
      }
      return Reflect.get(target, prop)
    },
  })
  provide(routerKey, wrappedRouter)
}
</script>

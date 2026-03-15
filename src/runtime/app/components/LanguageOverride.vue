<template>
  <slot :langcode="overrideLanguage" />
</template>

<script setup lang="ts">
/**
 * Override the current language for all components rendered in the default slot.
 *
 * Whenever a component down the tree uses useCurrentLanguage, it will receive
 * the provided override language.
 */
import { computed, provide } from '#imports'
import type { Langcode } from '#nuxt-language-negotiation/config'
import { toValidLanguage } from '../../helpers/toValidLanguage'
import { INJECT_OVERRIDE_LANGUAGE } from '../helpers/injection'

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
</script>

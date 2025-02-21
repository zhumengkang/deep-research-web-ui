<!-- Shows an accordion for reasoning (CoT) content. The accordion is default invisible,
until modelValue's length > 0 -->

<script setup lang="ts">
  const props = defineProps<{
    loading?: boolean
  }>()

  const modelValue = defineModel<string>()
  const items = computed(() => [
    {
      icon: 'i-lucide-brain',
      content: modelValue.value,
    },
  ])
  const currentOpen = ref('0')

  watchEffect(() => {
    if (props.loading) {
      currentOpen.value = '0'
    } else {
      currentOpen.value = '-1'
    }
  })
</script>

<template>
  <UAccordion
    v-if="modelValue"
    v-model="currentOpen"
    class="border border-gray-200 dark:border-gray-800 rounded-lg px-3 sm:px-4"
    :items="items"
    :loading="loading"
  >
    <template #leading="{ item }">
      <div
        :class="[
          loading && 'animate-pulse',
          'flex items-center gap-2 text-(--ui-primary)',
        ]"
      >
        <UIcon :name="item.icon" size="20" />
        {{ loading ? $t('modelThinking') : $t('modelThinkingComplete') }}
      </div>
    </template>
    <template #content="{ item }">
      <p class="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap mb-4">
        {{ item.content }}
      </p>
    </template>
  </UAccordion>
</template>

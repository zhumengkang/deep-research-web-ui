<script setup lang="ts">
  import { usePreferredColorScheme } from '@vueuse/core'

  const colorMode = useColorMode()
  const preferredColor = usePreferredColorScheme()
  const preference = computed(() => {
    // 默认为自动，会跟随用户的浏览器切换
    if (colorMode.preference === 'system') {
      if (preferredColor.value === 'no-preference') return 'dark'
      return preferredColor.value
    }
    return colorMode.preference
  })

  const toggleColorMode = () => {
    colorMode.preference = preference.value === 'light' ? 'dark' : 'light'
  }
</script>

<template>
  <div>
    <UButton
      :icon="preference === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
      color="primary"
      @click="toggleColorMode"
    />
  </div>
</template>

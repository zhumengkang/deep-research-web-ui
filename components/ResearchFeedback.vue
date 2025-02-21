<script setup lang="ts">
  import {
    feedbackInjectionKey,
    formInjectionKey,
  } from '~/constants/injection-keys'
  import { generateFeedback } from '~/lib/feedback'

  export interface ResearchFeedbackResult {
    assistantQuestion: string
    userAnswer: string
  }

  const props = defineProps<{
    isLoadingSearch?: boolean
  }>()

  defineEmits<{
    (e: 'submit'): void
  }>()

  const { t, locale } = useI18n()
  const { showConfigManager, isConfigValid } = storeToRefs(useConfigStore())
  const toast = useToast()

  const reasoningContent = ref('')
  const isLoading = ref(false)
  const error = ref('')

  // Inject global data from index.vue
  const form = inject(formInjectionKey)!
  const feedback = inject(feedbackInjectionKey)!

  const isSubmitButtonDisabled = computed(
    () =>
      !feedback.value.length ||
      // All questions should be answered
      feedback.value.some((v) => !v.assistantQuestion || !v.userAnswer) ||
      // Should not be loading
      isLoading.value ||
      props.isLoadingSearch,
  )

  async function getFeedback() {
    if (!isConfigValid.value) {
      toast.add({
        title: t('index.missingConfigTitle'),
        description: t('index.missingConfigDescription'),
        color: 'error',
      })
      showConfigManager.value = true
      return
    }
    clear()
    isLoading.value = true
    try {
      for await (const f of generateFeedback({
        query: form.value.query,
        numQuestions: form.value.numQuestions,
        language: t('language', {}, { locale: locale.value }),
      })) {
        if (f.type === 'reasoning') {
          reasoningContent.value += f.delta
        } else if (f.type === 'error') {
          error.value = f.message
        } else if (f.type === 'object') {
          const questions = f.value.questions!.filter(
            (s) => typeof s === 'string',
          )
          // Incrementally update modelValue
          for (let i = 0; i < questions.length; i += 1) {
            if (feedback.value[i]) {
              feedback.value[i].assistantQuestion = questions[i]
            } else {
              feedback.value.push({
                assistantQuestion: questions[i],
                userAnswer: '',
              })
            }
          }
        } else if (f.type === 'bad-end') {
          error.value = t('invalidStructuredOutput')
        }
      }
      console.log(
        `[ResearchFeedback] query: ${form.value.query}, feedback:`,
        feedback.value,
      )
      // Check if model returned questions
      if (!feedback.value.length) {
        error.value = t('modelFeedback.noQuestions')
      }
    } catch (e: any) {
      console.error('Error getting feedback:', e)
      if (e.message?.includes('Failed to fetch')) {
        e.message += `\n${t('error.requestBlockedByCORS')}`
      }
      error.value = t('modelFeedback.error', [e.message])
    } finally {
      isLoading.value = false
    }
  }

  function clear() {
    feedback.value = []
    error.value = ''
    reasoningContent.value = ''
  }

  defineExpose({
    getFeedback,
    clear,
    isLoading,
  })
</script>

<template>
  <UCard>
    <template #header>
      <h2 class="font-bold">{{ $t('modelFeedback.title') }}</h2>
      <p class="text-sm text-gray-500">
        {{ $t('modelFeedback.description') }}
      </p>
    </template>

    <div class="flex flex-col gap-2">
      <div v-if="!feedback.length && !reasoningContent && !error">
        {{ $t('modelFeedback.waiting') }}
      </div>
      <template v-else>
        <div v-if="error" class="text-red-500 whitespace-pre-wrap">
          {{ error }}
        </div>

        <ReasoningAccordion v-model="reasoningContent" :loading="isLoading" />

        <div
          v-for="(feedback, index) in feedback"
          class="flex flex-col gap-2"
          :key="index"
        >
          {{ feedback.assistantQuestion }}
          <UInput v-model="feedback.userAnswer" />
        </div>
      </template>
      <UButton
        color="primary"
        :loading="isLoadingSearch || isLoading"
        :disabled="isSubmitButtonDisabled"
        block
        @click="$emit('submit')"
      >
        {{ $t('modelFeedback.submit') }}
      </UButton>
    </div>
  </UCard>
</template>

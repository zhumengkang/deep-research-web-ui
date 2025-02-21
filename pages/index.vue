<template>
  <div>
    <UContainer>
      <div class="max-w-4xl mx-auto py-8 flex flex-col gap-y-4">
        <div class="flex flex-col sm:flex-row gap-2">
          <h1 class="text-3xl font-bold text-center mb-2">
            Deep Research
            <span class="text-xs text-gray-400 dark:text-gray-500">
              v{{ version }}
            </span>
          </h1>
          <div class="mx-auto sm:ml-auto sm:mr-0 flex items-center gap-2">
            <GitHubButton />
            <ConfigManager ref="configManagerRef" />
            <ColorModeButton />
            <LangSwitcher />
          </div>
        </div>

        <i18n-t
          class="whitespace-pre-wrap"
          keypath="index.projectDescription"
          tag="p"
        >
          <UButton
            class="!p-0"
            variant="link"
            href="https://github.com/dzhng/deep-research"
            target="_blank"
          >
            dzhng/deep-research
          </UButton>
        </i18n-t>

        <ResearchForm
          :is-loading-feedback="!!feedbackRef?.isLoading"
          ref="formRef"
          @submit="generateFeedback"
        />
        <ResearchFeedback
          :is-loading-search="!!deepResearchRef?.isLoading"
          ref="feedbackRef"
          @submit="startDeepSearch"
        />
        <DeepResearch ref="deepResearchRef" @complete="generateReport" />
        <ResearchReport ref="reportRef" />
      </div>
    </UContainer>
    <AutoUpdateToast />
  </div>
</template>

<script setup lang="ts">
  import type ResearchForm from '~/components/ResearchForm.vue'
  import type ResearchFeedback from '~/components/ResearchFeedback.vue'
  import type DeepResearch from '~/components/DeepResearch/DeepResearch.vue'
  import type ResearchReport from '~/components/ResearchReport.vue'
  import type ConfigManager from '~/components/ConfigManager.vue'
  import type { ResearchInputData } from '~/components/ResearchForm.vue'
  import type { ResearchFeedbackResult } from '~/components/ResearchFeedback.vue'
  import type { ResearchResult } from '~/lib/deep-research'
  import {
    feedbackInjectionKey,
    formInjectionKey,
    researchResultInjectionKey,
  } from '~/constants/injection-keys'

  const version = useRuntimeConfig().public.version

  const configManagerRef = ref<InstanceType<typeof ConfigManager>>()
  const formRef = ref<InstanceType<typeof ResearchForm>>()
  const feedbackRef = ref<InstanceType<typeof ResearchFeedback>>()
  const deepResearchRef = ref<InstanceType<typeof DeepResearch>>()
  const reportRef = ref<InstanceType<typeof ResearchReport>>()

  const form = ref<ResearchInputData>({
    query: '',
    breadth: 2,
    depth: 2,
    numQuestions: 3,
  })
  const feedback = ref<ResearchFeedbackResult[]>([])
  const researchResult = ref<ResearchResult>({
    learnings: [],
    visitedUrls: [],
  })

  provide(formInjectionKey, form)
  provide(feedbackInjectionKey, feedback)
  provide(researchResultInjectionKey, researchResult)

  async function generateFeedback() {
    feedbackRef.value?.getFeedback()
  }

  async function startDeepSearch() {
    deepResearchRef.value?.startResearch()
  }

  async function generateReport() {
    reportRef.value?.generateReport()
  }
</script>

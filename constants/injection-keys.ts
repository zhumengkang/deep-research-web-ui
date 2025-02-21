import type { ResearchFeedbackResult } from '~/components/ResearchFeedback.vue'
import type { ResearchInputData } from '~/components/ResearchForm.vue'
import type { ResearchResult } from '~/lib/deep-research'

export const formInjectionKey = Symbol() as InjectionKey<Ref<ResearchInputData>>
export const feedbackInjectionKey = Symbol() as InjectionKey<
  Ref<ResearchFeedbackResult[]>
>
export const researchResultInjectionKey = Symbol() as InjectionKey<
  Ref<ResearchResult>
>

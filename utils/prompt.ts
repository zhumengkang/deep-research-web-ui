import type { ResearchFeedbackResult } from '~/components/ResearchFeedback.vue'
import type { ResearchInputData } from '~/components/ResearchForm.vue'

export function getCombinedQuery(
  form: ResearchInputData,
  feedback: ResearchFeedbackResult[],
) {
  return `Initial Query: ${form.query}
Follow-up Questions and Answers:
${feedback
  .map((qa) => `Q: ${qa.assistantQuestion}\nA: ${qa.userAnswer}`)
  .join('\n')}
  `
}

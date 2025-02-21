import { createDeepSeek } from '@ai-sdk/deepseek'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { createOpenAI } from '@ai-sdk/openai'
import {
  extractReasoningMiddleware,
  wrapLanguageModel,
  type LanguageModelV1,
} from 'ai'

export const useAiModel = () => {
  const { config, aiApiBase } = useConfigStore()
  let model: LanguageModelV1

  if (config.ai.provider === 'openrouter') {
    const openRouter = createOpenRouter({
      apiKey: config.ai.apiKey,
      baseURL: aiApiBase,
    })
    model = openRouter(config.ai.model, {
      includeReasoning: true,
    })
  } else if (
    config.ai.provider === 'deepseek' ||
    config.ai.provider === 'siliconflow' ||
    // Special case if model name includes 'deepseek'
    // This ensures compatibilty with providers like Siliconflow
    config.ai.model?.toLowerCase().includes('deepseek')
  ) {
    const deepSeek = createDeepSeek({
      apiKey: config.ai.apiKey,
      baseURL: aiApiBase,
    })
    model = deepSeek(config.ai.model)
  } else {
    const openai = createOpenAI({
      apiKey: config.ai.apiKey,
      baseURL: aiApiBase,
    })
    model = openai(config.ai.model)
  }

  return wrapLanguageModel({
    model,
    middleware: extractReasoningMiddleware({ tagName: 'think' }),
  })
}

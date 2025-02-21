import { skipHydrate } from 'pinia'
import type { Locale } from '~/components/LangSwitcher.vue'

export type ConfigAiProvider =
  | 'openai-compatible'
  | 'siliconflow'
  | 'openrouter'
  | 'deepseek'
  | 'ollama'

export type ConfigWebSearchProvider = 'tavily' | 'firecrawl'

export interface ConfigAi {
  provider: ConfigAiProvider
  apiKey?: string
  apiBase?: string
  model: string
  contextSize?: number
}
export interface ConfigWebSearch {
  provider: ConfigWebSearchProvider
  apiKey?: string
  /** API base. Currently only works with Firecrawl */
  apiBase?: string
  /** Force the LLM to generate serp queries in a certain language */
  searchLanguage?: Locale
  /** Limit the number of concurrent tasks globally */
  concurrencyLimit?: number
  /** Tavily: use advanced search to retrieve higher quality results */
  tavilyAdvancedSearch?: boolean
  /** Tavily: search topic. Defaults to `general` */
  tavilySearchTopic?: 'general' | 'news' | 'finance'
}

export interface Config {
  ai: ConfigAi
  webSearch: ConfigWebSearch
}

function validateConfig(config: Config) {
  const ai = config.ai
  if (ai.provider !== 'ollama' && !ai.apiKey) return false
  if (typeof ai.contextSize !== 'undefined' && ai.contextSize < 0) return false

  const ws = config.webSearch
  if (ws.provider === 'tavily' && !ws.apiKey) return false
  // Either apiBase or apiKey is required for firecrawl
  if (ws.provider === 'firecrawl' && !ws.apiBase && !ws.apiKey) return false
  if (typeof ws.concurrencyLimit !== 'undefined' && ws.concurrencyLimit! < 1)
    return false
  return true
}

export const useConfigStore = defineStore('config', () => {
  const config = useLocalStorage<Config>('deep-research-config', {
    ai: {
      provider: 'openai-compatible',
      model: '',
      contextSize: 128_000,
    },
    webSearch: {
      provider: 'tavily',
      concurrencyLimit: 2,
    },
  } satisfies Config)
  // The version user dismissed the update notification
  const dismissUpdateVersion = useLocalStorage<string>(
    'dismiss-update-version',
    '',
  )
  const isConfigValid = computed(() => validateConfig(config.value))

  const aiApiBase = computed(() => {
    const { ai } = config.value
    if (ai.provider === 'openrouter') {
      return ai.apiBase || 'https://openrouter.ai/api/v1'
    }
    if (ai.provider === 'deepseek') {
      return ai.apiBase || 'https://api.deepseek.com/v1'
    }
    if (ai.provider === 'ollama') {
      return ai.apiBase || 'http://localhost:11434/v1'
    }
    if (ai.provider === 'siliconflow') {
      return ai.apiBase || 'https://api.siliconflow.cn/v1'
    }
    return ai.apiBase || 'https://api.openai.com/v1'
  })
  const webSearchApiBase = computed(() => {
    const { webSearch } = config.value
    if (webSearch.provider === 'tavily') {
      return
    }
    if (webSearch.provider === 'firecrawl') {
      return webSearch.apiBase || 'https://api.firecrawl.dev'
    }
  })

  const showConfigManager = ref(false)

  return {
    config: skipHydrate(config),
    isConfigValid,
    aiApiBase,
    webSearchApiBase,
    showConfigManager,
    dismissUpdateVersion: skipHydrate(dismissUpdateVersion),
  }
})

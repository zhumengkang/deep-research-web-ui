import pLimit from 'p-limit'

/**
 * The concurrency value used by the global limit.
 * This represents the *actual* limit value.
 * The value in `globalLimit` should not be used, because `deepResearch` uses recursive calls,
 * and `globalLimit.concurrency` can be much higher than the actual one.
 */
let globalLimitConcurrency = 2
const globalLimit = pLimit(globalLimitConcurrency)

export function usePLimit() {
  const { config } = useConfigStore()

  if (
    config.webSearch.concurrencyLimit &&
    config.webSearch.concurrencyLimit >= 1 &&
    globalLimitConcurrency !== config.webSearch.concurrencyLimit
  ) {
    console.log(
      `[usePLimit] Updating concurrency from ${globalLimitConcurrency} to ${config.webSearch.concurrencyLimit}. Current concurrency: ${globalLimit.concurrency}`,
    )
    let newLimit = config.webSearch.concurrencyLimit
    let diff = newLimit - globalLimitConcurrency
    globalLimitConcurrency = newLimit
    globalLimit.concurrency += diff
  }

  return globalLimit
}

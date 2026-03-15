'use client'

import { config, endpoints } from './config'
import type { FeatureFlag } from '@/types'

let flagCache: Record<string, boolean> = {}
let cacheTime = 0
const CACHE_TTL = 60_000 // 1 minute

export async function fetchFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    const res = await fetch(`${config.apiUrl}/api/v1${endpoints.features.list}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data = await res.json()
    const flags: FeatureFlag[] = data.flags ?? data ?? []

    // Update local cache
    flagCache = {}
    for (const f of flags) {
      flagCache[f.flag_name] = f.enabled
    }
    cacheTime = Date.now()
    return flags
  } catch {
    return []
  }
}

export function isFeatureEnabled(flagName: string): boolean {
  return flagCache[flagName] ?? false
}

export async function checkFeature(flagName: string): Promise<boolean> {
  if (Date.now() - cacheTime > CACHE_TTL) {
    await fetchFeatureFlags()
  }
  return isFeatureEnabled(flagName)
}

// Convenience constants matching backend flag names
export const FLAGS = {
  COMPARISON: 'FEATURE_COMPARISON',
  SEO: 'FEATURE_SEO',
  RANKING: 'FEATURE_RANKING',
  GRAPH: 'FEATURE_GRAPH',
  COMPETITION: 'FEATURE_COMPETITION',
  INSIGHT: 'FEATURE_INSIGHT',
  PROCUREMENT_AUTOMATION: 'FEATURE_PROCUREMENT_AUTOMATION',
} as const

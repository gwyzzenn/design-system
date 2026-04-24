/**
 * Build a reverse map from resolved CSS value → list of custom property names.
 * Also expands chains (--primary → var(--color-blue-6) → #0065EA).
 */

interface TokenMap {
  byResolved: Map<string, string[]>
  byName: Map<string, { raw: string; resolved: string; chain: string[] }>
}

const normalize = (v: string) => v.replace(/\s+/g, ' ').trim().toLowerCase()

let cached: { map: TokenMap; builtAt: number } | null = null
const TTL_MS = 2000

function readRootVars(): Map<string, string> {
  const out = new Map<string, string>()
  const root = document.documentElement
  const cs = getComputedStyle(root)
  for (let i = 0; i < cs.length; i++) {
    const name = cs.item(i)
    if (name.startsWith('--')) {
      out.set(name, cs.getPropertyValue(name).trim())
    }
  }
  return out
}

function resolveVarExpr(raw: string, vars: Map<string, string>, chain: string[] = []): string {
  let val = raw.trim()
  const re = /var\((--[a-zA-Z0-9-_]+)(?:,\s*([^)]+))?\)/
  let safety = 10
  while (re.test(val) && safety-- > 0) {
    val = val.replace(re, (_m, name: string, fallback?: string) => {
      const v = vars.get(name)
      if (v && v.length) {
        chain.push(name)
        return v
      }
      return fallback ? fallback.trim() : _m
    })
  }
  return val
}

export function buildTokenMap(): TokenMap {
  const now = Date.now()
  if (cached && now - cached.builtAt < TTL_MS) return cached.map

  const rawVars = readRootVars()
  const byName: TokenMap['byName'] = new Map()
  const byResolved: TokenMap['byResolved'] = new Map()

  rawVars.forEach((raw, name) => {
    const chain: string[] = []
    const resolved = resolveVarExpr(raw, rawVars, chain)
    byName.set(name, { raw, resolved, chain })
    const key = normalize(resolved)
    if (!byResolved.has(key)) byResolved.set(key, [])
    byResolved.get(key)!.push(name)
  })

  const map = { byName, byResolved }
  cached = { map, builtAt: now }
  return map
}

export interface TokenLookup {
  property: string
  raw: string
  resolved: string
  tokens: string[]
  chain: string[]
}

/**
 * Given a property value (resolved by the browser), find tokens that match.
 * Also handles values that contain var() references by re-resolving.
 * Approach:
 *   1. Normalize computed value (already resolved by browser → no var() left)
 *   2. Look up reverse map by normalized resolved value
 *   3. Return all tokens that resolve to same value
 */
export function lookupTokensForValue(property: string, resolvedValue: string): TokenLookup | null {
  if (!resolvedValue || resolvedValue === 'none' || resolvedValue === 'auto') return null
  const map = buildTokenMap()

  const tryKeys: string[] = [normalize(resolvedValue)]
  const colorMatch = resolvedValue.match(/rgba?\([^)]+\)/i) || resolvedValue.match(/#[0-9a-f]{3,8}\b/i)
  if (colorMatch) tryKeys.push(normalize(colorMatch[0]))
  const lenMatch = resolvedValue.match(/-?\d*\.?\d+px\b/)
  if (lenMatch && resolvedValue !== lenMatch[0]) tryKeys.push(normalize(lenMatch[0]))

  for (const k of tryKeys) {
    const names = map.byResolved.get(k)
    if (names && names.length) {
      const chain = names[0] ? map.byName.get(names[0])?.chain ?? [] : []
      return {
        property,
        raw: resolvedValue,
        resolved: resolvedValue,
        tokens: names,
        chain,
      }
    }
  }

  return null
}

export function annotateWithTokens(groups: Record<string, string>): TokenLookup[] {
  const out: TokenLookup[] = []
  for (const [prop, val] of Object.entries(groups)) {
    const hit = lookupTokensForValue(prop, val)
    if (hit) out.push(hit)
  }
  return out
}

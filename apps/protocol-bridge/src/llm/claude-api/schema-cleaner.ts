/**
 * JSON Schema cleaner for Antigravity/Gemini API compatibility.
 *
 * Ported from sub2api's schema_cleaner.go (CleanJSONSchema function).
 * Ensures tool input_schema definitions are compatible with Vertex AI /
 * Gemini backends by:
 *   1. Expanding $ref / $defs / definitions (real schema flattening)
 *   2. Merging allOf branches
 *   3. Resolving anyOf / oneOf to the best branch
 *   4. Migrating unsupported constraints to description hints
 *   5. Applying a strict whitelist filter (type/description/properties/required/items/enum/title)
 *   6. Filling empty object schemas with a placeholder property
 *   7. Aligning required fields with available properties
 *   8. Normalising type arrays (["string","null"] → "string" + "(nullable)")
 *   9. Coercing enum values to strings
 *
 * @see https://github.com/Wei-Shaw/sub2api/blob/main/backend/internal/pkg/antigravity/schema_cleaner.go
 */

type SchemaMap = Record<string, unknown>

// Whitelist — identical to sub2api schema_cleaner.go L226-234
const ALLOWED_FIELDS = new Set([
  "type",
  "description",
  "properties",
  "required",
  "items",
  "enum",
  "title",
])

// Constraint migration labels — identical to sub2api L358-374
const CONSTRAINT_FIELDS: ReadonlyArray<{ key: string; label: string }> = [
  { key: "minLength", label: "minLen" },
  { key: "maxLength", label: "maxLen" },
  { key: "pattern", label: "pattern" },
  { key: "minimum", label: "min" },
  { key: "maximum", label: "max" },
  { key: "multipleOf", label: "multipleOf" },
  { key: "exclusiveMinimum", label: "exclMin" },
  { key: "exclusiveMaximum", label: "exclMax" },
  { key: "minItems", label: "minItems" },
  { key: "maxItems", label: "maxItems" },
  { key: "propertyNames", label: "propertyNames" },
  { key: "format", label: "format" },
]

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Main entry — equivalent to sub2api's `CleanJSONSchema`.
 */
export function cleanJsonSchema(
  schema: SchemaMap | null | undefined
): SchemaMap | null {
  if (!schema) return null

  const copy = deepCopy(schema) as SchemaMap

  // Step 0: expand $ref
  const defs = extractDefs(copy)
  flattenRefs(copy, defs)

  // Recursive clean
  cleanRecursive(copy)

  return copy
}

/**
 * Deep-clean `"[undefined]"` string values — sub2api's `DeepCleanUndefined`.
 */
export function deepCleanUndefined(value: unknown): void {
  if (!value) return
  if (isObject(value)) {
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === "string" && v === "[undefined]") {
        delete (value as SchemaMap)[k]
        continue
      }
      deepCleanUndefined(v)
    }
  } else if (Array.isArray(value)) {
    for (const item of value) {
      deepCleanUndefined(item)
    }
  }
}

// ---------------------------------------------------------------------------
// Step 0 — $ref / $defs expansion (sub2api extractDefs + flattenRefs)
// ---------------------------------------------------------------------------

function extractDefs(schema: SchemaMap): SchemaMap {
  const defs: SchemaMap = {}
  for (const field of ["$defs", "definitions"] as const) {
    const d = schema[field]
    if (isObject(d)) {
      for (const [k, v] of Object.entries(d as SchemaMap)) {
        defs[k] = v
      }
      delete schema[field]
    }
  }
  return defs
}

function flattenRefs(schema: SchemaMap, defs: SchemaMap): void {
  if (Object.keys(defs).length === 0) return

  const ref = schema["$ref"]
  if (typeof ref === "string") {
    delete schema["$ref"]
    const parts = ref.split("/")
    const refName = parts[parts.length - 1]!
    if (!refName) return

    const defSchema = defs[refName]
    if (isObject(defSchema)) {
      for (const [k, v] of Object.entries(defSchema as SchemaMap)) {
        if (!(k in schema)) {
          schema[k] = deepCopy(v)
        }
      }
      // recurse after merge
      flattenRefs(schema, defs)
    }
  }

  // traverse children
  for (const v of Object.values(schema)) {
    if (isObject(v)) {
      flattenRefs(v as SchemaMap, defs)
    } else if (Array.isArray(v)) {
      for (const item of v) {
        if (isObject(item)) {
          flattenRefs(item as SchemaMap, defs)
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Core recursive cleaner (sub2api cleanJSONSchemaRecursive)
// ---------------------------------------------------------------------------

function cleanRecursive(value: unknown): unknown {
  if (!isObject(value)) return value
  const schema = value as SchemaMap

  // 0. merge allOf
  mergeAllOf(schema)

  // 1. recurse into sub-schemas
  if (isObject(schema.properties)) {
    for (const v of Object.values(schema.properties as SchemaMap)) {
      cleanRecursive(v)
    }
  } else if ("items" in schema) {
    if (Array.isArray(schema.items)) {
      // tuple → pick best
      const best =
        extractBestSchemaFromUnion(schema.items) ??
        ({ type: "string" } as SchemaMap)
      schema.items = cleanRecursive(best)
    } else {
      cleanRecursive(schema.items)
    }
  } else {
    for (const v of Object.values(schema)) {
      if (isObject(v)) {
        cleanRecursive(v)
      } else if (Array.isArray(v)) {
        for (const item of v) {
          cleanRecursive(item)
        }
      }
    }
  }

  // 2. anyOf / oneOf union
  const typeStr = typeof schema.type === "string" ? schema.type : ""
  let unionArray: unknown[] | null = null
  if (typeStr === "" || typeStr === "object") {
    if (Array.isArray(schema.anyOf)) {
      unionArray = schema.anyOf
    } else if (Array.isArray(schema.oneOf)) {
      unionArray = schema.oneOf
    }
  }

  if (unionArray && unionArray.length > 0) {
    const bestBranch = extractBestSchemaFromUnion(unionArray)
    if (bestBranch && isObject(bestBranch)) {
      const bestMap = bestBranch as SchemaMap
      for (const [k, v] of Object.entries(bestMap)) {
        if (k === "properties") {
          let targetProps = schema.properties as SchemaMap | undefined
          if (!isObject(targetProps)) {
            targetProps = {}
            schema.properties = targetProps
          }
          if (isObject(v)) {
            for (const [pk, pv] of Object.entries(v as SchemaMap)) {
              if (!(pk in targetProps)) {
                targetProps[pk] = deepCopy(pv)
              }
            }
          }
        } else if (k === "required") {
          const targetReq = (schema.required as string[]) || []
          if (Array.isArray(v)) {
            for (const rv of v) {
              if (typeof rv === "string" && !targetReq.includes(rv)) {
                targetReq.push(rv)
              }
            }
            schema.required = targetReq
          }
        } else if (!(k in schema)) {
          schema[k] = deepCopy(v)
        }
      }
    }
  }

  // 3. Is this a schema node?
  const looksLikeSchema =
    "type" in schema ||
    "properties" in schema ||
    "items" in schema ||
    "enum" in schema ||
    "anyOf" in schema ||
    "oneOf" in schema ||
    "allOf" in schema

  if (!looksLikeSchema) return schema

  // 4. migrate constraints → description
  migrateConstraints(schema)

  // 5. whitelist filter
  for (const k of Object.keys(schema)) {
    if (!ALLOWED_FIELDS.has(k)) {
      delete schema[k]
    }
  }

  // 6. empty object placeholder
  if (schema.type === "object") {
    const props = schema.properties as SchemaMap | undefined
    if (!props || !isObject(props) || Object.keys(props).length === 0) {
      schema.properties = {
        reason: {
          type: "string",
          description: "Reason for calling this tool",
        },
      }
      schema.required = ["reason"]
    }
  }

  // 7. required ↔ properties alignment
  if (isObject(schema.properties)) {
    const props = schema.properties as SchemaMap
    const req = schema.required
    if (Array.isArray(req)) {
      const validReq = req.filter((r) => typeof r === "string" && r in props)
      if (validReq.length > 0) {
        schema.required = validReq
      } else {
        delete schema.required
      }
    }
  }

  // 8. normalise type
  let isEffectivelyNullable = false
  if ("type" in schema) {
    let selectedType: string
    const typeVal = schema.type
    if (typeof typeVal === "string") {
      const lower = typeVal.toLowerCase()
      if (lower === "null") {
        isEffectivelyNullable = true
        selectedType = "string"
      } else {
        selectedType = lower
      }
    } else if (Array.isArray(typeVal)) {
      isEffectivelyNullable = typeVal.some(
        (t) => typeof t === "string" && t.toLowerCase() === "null"
      )
      const nonNull = typeVal.filter(
        (t) => typeof t === "string" && t.toLowerCase() !== "null"
      )
      selectedType =
        nonNull.length > 0 ? (nonNull[0] as string).toLowerCase() : "string"
    } else {
      selectedType = "object"
    }
    schema.type = selectedType
  } else {
    schema.type = "properties" in schema ? "object" : "object"
  }

  if (isEffectivelyNullable) {
    const desc =
      typeof schema.description === "string" ? schema.description : ""
    if (!desc.includes("nullable")) {
      schema.description = desc ? `${desc} (nullable)` : "(nullable)"
    }
  }

  // 9. enum → string coercion
  if (Array.isArray(schema.enum)) {
    let hasNonString = false
    const enumVals = schema.enum as unknown[]
    for (let i = 0; i < enumVals.length; i++) {
      if (typeof enumVals[i] !== "string") {
        hasNonString = true
        enumVals[i] = enumVals[i] === null ? "null" : String(enumVals[i])
      }
    }
    if (hasNonString) {
      schema.type = "string"
    }
  }

  return schema
}

// ---------------------------------------------------------------------------
// allOf merger (sub2api mergeAllOf)
// ---------------------------------------------------------------------------

function mergeAllOf(m: SchemaMap): void {
  const allOf = m.allOf
  if (!Array.isArray(allOf)) return
  delete m.allOf

  const mergedProps: SchemaMap = {}
  const mergedReq = new Set<string>()
  const otherFields: SchemaMap = {}

  for (const sub of allOf) {
    if (!isObject(sub)) continue
    const subMap = sub as SchemaMap

    if (isObject(subMap.properties)) {
      for (const [k, v] of Object.entries(subMap.properties as SchemaMap)) {
        mergedProps[k] = v
      }
    }
    if (Array.isArray(subMap.required)) {
      for (const r of subMap.required) {
        if (typeof r === "string") mergedReq.add(r)
      }
    }
    for (const [k, v] of Object.entries(subMap)) {
      if (k !== "properties" && k !== "required" && k !== "allOf") {
        if (!(k in otherFields)) otherFields[k] = v
      }
    }
  }

  for (const [k, v] of Object.entries(otherFields)) {
    if (!(k in m)) m[k] = v
  }
  if (Object.keys(mergedProps).length > 0) {
    let existProps = m.properties as SchemaMap | undefined
    if (!isObject(existProps)) {
      existProps = {}
      m.properties = existProps
    }
    for (const [k, v] of Object.entries(mergedProps)) {
      if (!(k in existProps)) existProps[k] = v
    }
  }
  if (mergedReq.size > 0) {
    const existReq = Array.isArray(m.required)
      ? (m.required as string[]).filter((r) => typeof r === "string")
      : []
    const existSet = new Set(existReq)
    for (const r of mergedReq) {
      if (!existSet.has(r)) existReq.push(r)
    }
    m.required = existReq
  }
}

// ---------------------------------------------------------------------------
// Constraint migration (sub2api migrateConstraints)
// ---------------------------------------------------------------------------

function migrateConstraints(m: SchemaMap): void {
  const hints: string[] = []
  for (const c of CONSTRAINT_FIELDS) {
    if (c.key in m && m[c.key] != null) {
      hints.push(`${c.label}: ${String(m[c.key])}`)
    }
  }
  if (hints.length > 0) {
    const suffix = ` [Constraint: ${hints.join(", ")}]`
    const desc = typeof m.description === "string" ? m.description : ""
    if (!desc.includes(suffix)) {
      m.description = desc + suffix
    }
  }
}

// ---------------------------------------------------------------------------
// Union resolution (sub2api extractBestSchemaFromUnion + scoreSchemaOption)
// ---------------------------------------------------------------------------

function extractBestSchemaFromUnion(unionArray: unknown[]): unknown {
  let bestOption: unknown = null
  let bestScore = -1
  for (const item of unionArray) {
    const score = scoreSchemaOption(item)
    if (score > bestScore) {
      bestScore = score
      bestOption = item
    }
  }
  return bestOption
}

function scoreSchemaOption(val: unknown): number {
  if (!isObject(val)) return 0
  const m = val as SchemaMap
  const typeStr = typeof m.type === "string" ? m.type : ""
  if ("properties" in m || typeStr === "object") return 3
  if ("items" in m || typeStr === "array") return 2
  if (typeStr !== "" && typeStr !== "null") return 1
  return 0
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function deepCopy(src: unknown): unknown {
  if (src === null || src === undefined) return src
  if (Array.isArray(src)) return src.map(deepCopy)
  if (typeof src === "object") {
    const dst: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(src)) {
      dst[k] = deepCopy(v)
    }
    return dst
  }
  return src
}

function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === "object" && !Array.isArray(val)
}

import { BUILDER_STORE_KEY } from '../constants/templateFlow'
import { normalizeGitStatsSections } from './gitStats'

const isObject = (value) => value !== null && typeof value === 'object'

const isValidSection = (section) =>
  isObject(section)
  && typeof section.id === 'string'
  && section.id.trim().length > 0
  && typeof section.type === 'string'
  && section.type.trim().length > 0

export const sanitizeTags = (input) => {
  if (!Array.isArray(input)) return []
  return Array.from(
    new Set(
      input
        .map((tag) => String(tag ?? '').trim())
        .filter(Boolean),
    ),
  ).slice(0, 8)
}

export const normalizeTemplatePayload = (input) => {
  const payload = isObject(input) ? input : {}
  const rawSections = Array.isArray(payload.sections)
    ? payload.sections.filter(isValidSection)
    : []
  const sections = normalizeGitStatsSections(rawSections, { titleText: 'Git Stats' })
  const previewTheme = payload.previewTheme === 'light' ? 'light' : 'dark'
  return {
    sections,
    previewTheme,
  }
}

export const getPersistedBuilderSnapshot = () => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(BUILDER_STORE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    const state = isObject(parsed) && isObject(parsed.state) ? parsed.state : parsed
    const normalized = normalizeTemplatePayload(state)
    if (!normalized.sections.length) return null
    return normalized
  } catch {
    return null
  }
}

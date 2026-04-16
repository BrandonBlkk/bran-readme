export const GIT_STATS_CARD_DEFINITIONS = [
  { id: 'main', label: 'GitHub Stats', toggleKey: 'showMainStats' },
  { id: 'languages', label: 'Top Languages', toggleKey: 'showLanguageStats' },
  { id: 'streak', label: 'Streak Stats', toggleKey: 'showStreakStats' },
  { id: 'activity', label: 'Activity Graph', toggleKey: 'showActivityGraph' },
  { id: 'trophies', label: 'GitHub Trophies', toggleKey: 'showTrophyStats' },
]

export const DEFAULT_GIT_STATS_ORDER = GIT_STATS_CARD_DEFINITIONS.map((item) => item.id)

const GIT_STATS_CARD_IDS = new Set(DEFAULT_GIT_STATS_ORDER)
const LEGACY_GIT_SECTION_TYPES = new Set(['stats', 'streak', 'activity'])
const LEGACY_GIT_TITLES = new Set([
  'stats',
  'github stats',
  'git stats',
  'streak stats',
  'activity graph',
])

const clone = (value) => JSON.parse(JSON.stringify(value ?? {}))
const normalizeTextValue = (value) => String(value ?? '').trim()
const isHeadingSize = (value) => /^h[1-6]$/i.test(String(value ?? '').trim())
const hasValidOrderEntry = (value) =>
  Array.isArray(value) && value.some((item) => GIT_STATS_CARD_IDS.has(String(item ?? '').trim()))

const pushUnique = (list, value) => {
  if (!value || list.includes(value)) return
  list.push(value)
}

const buildLegacyOrder = (sections) => {
  const order = []

  sections.forEach((section) => {
    const content = section.content ?? {}

    if (section.type === 'stats') {
      if (content.showMainStats !== false) pushUnique(order, 'main')
      if (content.showLanguageStats !== false) pushUnique(order, 'languages')
      if (content.showStreakStats !== false) pushUnique(order, 'streak')
      if (content.showActivityGraph !== false) pushUnique(order, 'activity')
      if (content.showTrophyStats !== false) pushUnique(order, 'trophies')
      return
    }

    if (section.type === 'streak') {
      pushUnique(order, 'streak')
      return
    }

    if (section.type === 'activity') {
      pushUnique(order, 'activity')
    }
  })

  return order
}

const applyDefinedValues = (target, values) => {
  Object.entries(values).forEach(([key, value]) => {
    if (typeof value !== 'undefined') {
      target[key] = value
    }
  })
}

const mapStreakContent = (content = {}) => ({
  showStreakStats: true,
  streakTheme: content.theme,
  streakHideBorder: content.hideBorder,
  streakBgColor: content.bgColor,
  streakStrokeColor: content.strokeColor,
  streakRingColor: content.ringColor,
  streakFireColor: content.fireColor,
  streakCurrStreakColor: content.currStreakColor,
  streakSideNumColor: content.sideNumColor,
  streakSideLabelsColor: content.sideLabelsColor,
  streakDateColor: content.dateColor,
  streakBorderRadius: content.borderRadius,
})

const mapActivityContent = (content = {}) => ({
  showActivityGraph: true,
  activityTheme: content.theme,
  activityHideBorder: content.hideBorder,
  activityHideGrid: content.hideGrid,
  activityShowArea: content.area,
  activityBgColor: content.bgColor,
  activityLineColor: content.lineColor,
  activityPointColor: content.pointColor,
  activityAreaColor: content.areaColor,
  activityRadius: content.radius,
})

export const normalizeGitStatsOrder = (value) => {
  const order = []

  if (Array.isArray(value)) {
    value.forEach((item) => {
      const normalized = String(item ?? '').trim()
      if (GIT_STATS_CARD_IDS.has(normalized)) {
        pushUnique(order, normalized)
      }
    })
  }

  DEFAULT_GIT_STATS_ORDER.forEach((item) => pushUnique(order, item))
  return order
}

export const normalizeGitStatsContent = (content = {}, options = {}) => {
  const { hasLegacyStatsSection = true } = options
  const next = {
    ...clone(content),
    statsOrder: normalizeGitStatsOrder(content.statsOrder),
  }

  if (typeof next.showStreakStats === 'undefined') {
    next.showStreakStats = false
  }

  if (typeof next.showActivityGraph === 'undefined') {
    next.showActivityGraph = false
  }

  if (!hasLegacyStatsSection) {
    if (typeof content.showMainStats === 'undefined') next.showMainStats = false
    if (typeof content.showLanguageStats === 'undefined') next.showLanguageStats = false
    if (typeof content.showTrophyStats === 'undefined') next.showTrophyStats = false
  }

  return next
}

export const isGitStatsHeadingSection = (section) =>
  section?.type === 'text'
  && isHeadingSize(section.content?.size)
  && LEGACY_GIT_TITLES.has(normalizeTextValue(section.content?.text).toLowerCase())

export const normalizeGitStatsSections = (
  inputSections,
  {
    defaultStatsContent = {},
    titleText = 'Git Stats',
  } = {},
) => {
  const sections = Array.isArray(inputSections)
    ? inputSections.map((section) => ({
        ...section,
        content: clone(section.content),
      }))
    : []

  if (!sections.length) return []

  const statsEntries = []
  const legacyEntries = []

  sections.forEach((section, index) => {
    if (!LEGACY_GIT_SECTION_TYPES.has(section.type)) return
    if (section.type === 'stats') statsEntries.push({ section, index })
    else legacyEntries.push({ section, index })
  })

  if (!legacyEntries.length) {
    return sections.map((section) =>
      section.type === 'stats'
        ? {
            ...section,
            content: normalizeGitStatsContent(section.content, { hasLegacyStatsSection: true }),
          }
        : section,
    )
  }

  const statsEntry = statsEntries[0] ?? legacyEntries[0]
  const entriesToMerge = [
    ...(statsEntries.length ? [statsEntry] : []),
    ...legacyEntries,
  ]
  const mergedIndexes = new Set(entriesToMerge.map((entry) => entry.index))
  const headingEntries = sections.flatMap((section, index) => {
    if (!isGitStatsHeadingSection(section)) return []
    return mergedIndexes.has(index + 1) ? [{ section, index }] : []
  })

  const hasLegacyStatsSection = statsEntries.length > 0
  const mergedContent = normalizeGitStatsContent(
    hasLegacyStatsSection
      ? {
          ...clone(defaultStatsContent),
          ...clone(statsEntry.section.content),
        }
      : clone(defaultStatsContent),
    { hasLegacyStatsSection },
  )

  const streakEntry = legacyEntries.find((entry) => entry.section.type === 'streak')
  if (streakEntry) {
    applyDefinedValues(mergedContent, mapStreakContent(streakEntry.section.content))
  }

  const activityEntry = legacyEntries.find((entry) => entry.section.type === 'activity')
  if (activityEntry) {
    applyDefinedValues(mergedContent, mapActivityContent(activityEntry.section.content))
  }

  mergedContent.statsOrder = hasValidOrderEntry(statsEntry.section.content?.statsOrder)
    ? normalizeGitStatsOrder(statsEntry.section.content.statsOrder)
    : normalizeGitStatsOrder(buildLegacyOrder(entriesToMerge.map((entry) => entry.section)))

  const mergedSection = {
    ...statsEntry.section,
    type: 'stats',
    content: mergedContent,
  }

  const removedIds = new Set(
    [...entriesToMerge, ...headingEntries].map((entry) => entry.section.id),
  )
  const insertAt = Math.min(
    ...[...entriesToMerge, ...headingEntries].map((entry) => entry.index),
  )
  const nextSections = sections.filter((section) => !removedIds.has(section.id))
  const normalizedInsertAt = sections
    .slice(0, insertAt)
    .filter((section) => !removedIds.has(section.id))
    .length

  const itemsToInsert = []

  if (headingEntries.length) {
    const sourceHeading = headingEntries[0].section
    itemsToInsert.push({
      ...sourceHeading,
      content: {
        ...clone(sourceHeading.content),
        text: titleText,
        size: sourceHeading.content?.size ?? 'h2',
        align: sourceHeading.content?.align ?? 'left',
        divider: sourceHeading.content?.divider !== false,
      },
    })
  }

  itemsToInsert.push(mergedSection)
  nextSections.splice(normalizedInsertAt, 0, ...itemsToInsert)

  return nextSections.map((section) =>
    section.type === 'stats'
      ? {
          ...section,
          content: normalizeGitStatsContent(section.content, { hasLegacyStatsSection: true }),
        }
      : section,
  )
}

import React, { useEffect, useMemo, useState } from 'react'
import { useRef } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { Plus, Trash2, Sparkles, MessageSquare } from 'lucide-react'
import FeedbackModal from './feedback/FeedbackModal'
import { labelClass, inputClass } from './readme-builder/FormFields'
import SectionEditor from './readme-builder/SectionEditor'
import Preview from './readme-builder/Preview'
import SortableSectionCard from './readme-builder/SortableSectionCard'
import DragPreview from './readme-builder/DragPreview'
import EmptyState from './readme-builder/EmptyState'
import GithubModeToggle from './readme-builder/GithubModeToggle'
import { PENDING_TEMPLATE_KEY, PENDING_TEMPLATE_UPDATE_KEY } from '../constants/templateFlow'
import { normalizeTemplatePayload } from '../utils/templatePayload'
import { normalizeGitStatsOrder, normalizeGitStatsSections } from '../utils/gitStats'
import { DEFAULT_PROFILE, getResolvedProfile, useProfileStore } from '../stores/profileStore'
import {
  generateMarkdown,
  TECH_OPTIONS,
  SOCIAL_OPTIONS,
  FALLBACK_ICON,
  buildStatsUrl,
} from '../utils/markdown'

/* ── Helpers ───────────────────────────────────────── */
const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `sec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

const clone = (value) => JSON.parse(JSON.stringify(value))

const normalizeTextValue = (value) => String(value ?? '').trim()

const getActiveProfileDefaults = () => {
  const profile = getResolvedProfile()
  return {
    displayName: normalizeTextValue(profile.displayName) || DEFAULT_PROFILE.displayName,
    githubUser: normalizeTextValue(profile.githubUser) || DEFAULT_PROFILE.githubUser,
    website: normalizeTextValue(profile.website) || DEFAULT_PROFILE.website,
    location: normalizeTextValue(profile.location) || DEFAULT_PROFILE.location,
  }
}

const shouldReplaceWithProfileDefault = (currentValue, fallbackValue, previousSyncedValue, force) => {
  const current = normalizeTextValue(currentValue)
  if (force) return true
  if (!current) return true
  if (current === normalizeTextValue(fallbackValue)) return true
  if (previousSyncedValue && current === normalizeTextValue(previousSyncedValue)) return true
  return false
}

const applyProfileDefaultsToSections = (
  sections,
  profileDefaults,
  {
    force = false,
    previousDisplayName = '',
    previousGithubUser = '',
    previousWebsite = '',
    previousLocation = '',
  } = {},
) => {
  let hasChanges = false

  const nextSections = sections.map((section) => {
    if (section.type === 'header') {
      const nextName = normalizeTextValue(profileDefaults.displayName) || DEFAULT_PROFILE.displayName
      const nextWebsite = normalizeTextValue(profileDefaults.website) || DEFAULT_PROFILE.website
      const nextLocation = normalizeTextValue(profileDefaults.location) || DEFAULT_PROFILE.location
      const currentName = normalizeTextValue(section.content?.name)
      const currentWebsite = normalizeTextValue(section.content?.website)
      const currentLocation = normalizeTextValue(section.content?.location)
      const shouldReplace = shouldReplaceWithProfileDefault(
        currentName,
        DEFAULT_PROFILE.displayName,
        previousDisplayName,
        force,
      )
      const shouldReplaceWebsite = shouldReplaceWithProfileDefault(
        currentWebsite,
        DEFAULT_PROFILE.website,
        previousWebsite,
        force,
      )
      const shouldReplaceLocation = shouldReplaceWithProfileDefault(
        currentLocation,
        DEFAULT_PROFILE.location,
        previousLocation,
        force,
      )

      if (
        (!shouldReplace || currentName === nextName)
        && (!shouldReplaceWebsite || currentWebsite === nextWebsite)
        && (!shouldReplaceLocation || currentLocation === nextLocation)
      ) {
        return section
      }

      hasChanges = true
      return {
        ...section,
        content: {
          ...section.content,
          ...(shouldReplace && currentName !== nextName ? { name: nextName } : {}),
          ...(shouldReplaceWebsite && currentWebsite !== nextWebsite ? { website: nextWebsite } : {}),
          ...(shouldReplaceLocation && currentLocation !== nextLocation ? { location: nextLocation } : {}),
        },
      }
    }

    if (section.type === 'stats' || section.type === 'streak' || section.type === 'activity' || section.type === 'badges' || section.type === 'repos') {
      const nextUsername = normalizeTextValue(profileDefaults.githubUser) || DEFAULT_PROFILE.githubUser
      const currentUsername = normalizeTextValue(section.content?.username)
      const shouldReplace = shouldReplaceWithProfileDefault(
        currentUsername,
        DEFAULT_PROFILE.githubUser,
        previousGithubUser,
        force,
      )

      if (!shouldReplace || currentUsername === nextUsername) return section

      hasChanges = true
      return {
        ...section,
        content: {
          ...section.content,
          username: nextUsername,
        },
      }
    }

    return section
  })

  return {
    sections: nextSections,
    hasChanges,
  }
}

/* ── Template Content ──────────────────────────────── */
const BASE_TEMPLATE_CONTENT = {
  header: {
    name: 'Brandon Developer',
    tagline: 'Designing developer experiences that ship.',
    location: 'Yangon, Myanmar',
    website: 'https://brandondevme.vercel.app',
    align: 'left',
  },
  about: {
    text: 'I build clean, fast developer tooling with a focus on UX and performance.',
    align: 'left',
  },
  stats: {
    theme: 'transparent',
    showMainStats: true,
    showLanguageStats: true,
    showStreakStats: true,
    showActivityGraph: true,
    showTrophyStats: true,
    statsOrder: normalizeGitStatsOrder(['main', 'languages', 'streak', 'activity', 'trophies']),
    showIcons: true,
    hideBorder: true,
    includeAllCommits: false,
    countPrivate: false,
    rankIcon: 'github',
    bgColor: '#171f2b',
    titleColor: '#58a6ff',
    textColor: '#c9d1d9',
    iconColor: '#58a6ff',
    borderRadius: 8,
    cardWidth: 420,
    lineHeight: 28,
    streakTheme: 'dark',
    streakHideBorder: true,
    streakBgColor: '#171f2b',
    streakStrokeColor: '#58a6ff',
    streakRingColor: '#58a6ff',
    streakFireColor: '#fbbf24',
    streakCurrStreakColor: '#58a6ff',
    streakSideNumColor: '#c9d1d9',
    streakSideLabelsColor: '#8b949e',
    streakDateColor: '#8b949e',
    streakBorderRadius: 8,
    activityTheme: 'github-compact',
    activityBgColor: '#171f2b',
    activityLineColor: '#58a6ff',
    activityPointColor: '#58a6ff',
    activityAreaColor: '#58a6ff',
    activityHideBorder: true,
    activityHideGrid: false,
    activityShowArea: false,
    activityRadius: 8,
  },
  streak: {
    theme: 'dark',
    hideBorder: true,
    bgColor: '#171f2b',
    strokeColor: '#58a6ff',
    ringColor: '#58a6ff',
    fireColor: '#fbbf24',
    currStreakColor: '#58a6ff',
    sideNumColor: '#c9d1d9',
    sideLabelsColor: '#8b949e',
    dateColor: '#8b949e',
    borderRadius: 8,
  },
  activity: {
    theme: 'github-compact',
    bgColor: '#171f2b',
    lineColor: '#58a6ff',
    pointColor: '#58a6ff',
    areaColor: '#58a6ff',
    hideBorder: true,
    hideGrid: false,
    radius: 8,
  },
  badges: {
    items: [
      { type: 'profile-views', label: 'Profile Views', color: '58a6ff' },
      { type: 'followers', label: 'Followers', color: '22c55e' },
    ],
    align: 'left',
  },
  repos: {
    count: 4,
    showStars: true,
    showForks: true,
    showDescription: true,
    align: 'center',
  },
  snippet: {
    type: 'currently-learning',
    items: ['Next.js', 'GraphQL', 'Rust'],
    align: 'left',
  },
  skills: {
    items: ['react', 'typescript', 'tailwindcss', 'vite', 'nodedotjs'],
    iconSize: 40,
    iconSpacing: 1,
    align: 'left',
  },
  socials: {
    iconSize: 40,
    iconSpacing: 1,
    align: 'left',
    links: [
      { label: 'LinkedIn', slug: 'linkedin', url: 'https://linkedin.com/in/username' },
      { label: 'Instagram', slug: 'instagram', url: 'https://youtube.com/@username' },
      { label: 'Discord', slug: 'discord', url: 'https://discord.gg/yourserver' },
    ],
  },
  text: {
    text: "Hi, I'm Brandon 👋",
    size: 'h2',
    align: 'center',
    divider: true,
  },
}

const getTemplateContent = () => {
  const { displayName, githubUser, website, location } = getActiveProfileDefaults()
  return {
    ...clone(BASE_TEMPLATE_CONTENT),
    header: {
      ...clone(BASE_TEMPLATE_CONTENT.header),
      name: displayName,
      website,
      location,
    },
    stats: {
      ...clone(BASE_TEMPLATE_CONTENT.stats),
      username: githubUser,
    },
    streak: {
      ...clone(BASE_TEMPLATE_CONTENT.streak),
      username: githubUser,
    },
    activity: {
      ...clone(BASE_TEMPLATE_CONTENT.activity),
      username: githubUser,
    },
    badges: {
      ...clone(BASE_TEMPLATE_CONTENT.badges),
      username: githubUser,
    },
    repos: {
      ...clone(BASE_TEMPLATE_CONTENT.repos),
      username: githubUser,
    },
  }
}

const SECTION_LIBRARY = [
  { type: 'header', label: 'Header', description: 'Name, tagline, and key links.' },
  { type: 'about', label: 'About', description: 'Short bio or mission statement.' },
  { type: 'stats', label: 'Git Stats', description: 'Main stats, streak, activity graph, and trophies in one section.' },
  { type: 'badges', label: 'Custom Badges', description: 'Profile views, followers, and custom badges.' },
  { type: 'repos', label: 'Pinned Repos', description: 'Showcase your pinned GitHub repositories.' },
  { type: 'snippet', label: 'Quick Snippets', description: 'Currently learning, working on, fun facts.' },
  { type: 'skills', label: 'Skills Icons', description: 'Simple Icons tech stack strip.' },
  { type: 'socials', label: 'Social Links', description: 'Primary links and profiles.' },
  { type: 'text', label: 'Text Block', description: 'Custom text with size and alignment.' },
]

const createSection = (type) => ({
  id: createId(),
  type,
  content: clone(getTemplateContent()[type] ?? {}),
})

const createTextTitleSection = (title) => ({
  id: createId(),
  type: 'text',
  content: {
    text: title,
    size: 'h2',
    align: 'left',
    divider: true,
  },
})

const getDefaultSections = () => [
  createSection('header'),
  createTextTitleSection('About'),
  createSection('about'),
  createTextTitleSection('Git Stats'),
  createSection('stats'),
  createTextTitleSection('Tech Stack'),
  createSection('skills'),
  createTextTitleSection('Socials'),
  createSection('socials'),
]

const normalizeBuilderSections = (sections) =>
  normalizeGitStatsSections(sections, {
    defaultStatsContent: getTemplateContent().stats,
    titleText: 'Git Stats',
  })

const moveItem = (list, fromIndex, toIndex) => {
  const next = [...list]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

/* ── Store ─────────────────────────────────────────── */
const useSectionStore = create(
  persist(
    (set, get) => ({
      sections: getDefaultSections(),
      previewTheme: 'dark',
      syncedDisplayName: getActiveProfileDefaults().displayName,
      syncedGithubUsername: getActiveProfileDefaults().githubUser,
      syncedWebsite: getActiveProfileDefaults().website,
      syncedLocation: getActiveProfileDefaults().location,
      setPreviewTheme: (theme) => set({ previewTheme: theme }),
      addSection: (type) =>
        set((state) => ({
          sections: normalizeBuilderSections([
            ...state.sections,
            ...(SECTION_TITLE_MAP[type]
              ? [createTextTitleSection(SECTION_TITLE_MAP[type])]
              : []),
            createSection(type),
          ]),
        })),
      removeSection: (id) =>
        set((state) => ({
          sections: state.sections.filter((section) => section.id !== id),
        })),
      updateSection: (id, updates) =>
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === id
              ? { ...section, content: { ...section.content, ...updates } }
              : section,
          ),
        })),
      setSections: (sections) => set({ sections: normalizeBuilderSections(sections) }),
      moveSection: (activeId, overId) => {
        const { sections } = get()
        const fromIndex = sections.findIndex((section) => section.id === activeId)
        const toIndex = sections.findIndex((section) => section.id === overId)
        if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return
        set({ sections: moveItem(sections, fromIndex, toIndex) })
      },
      syncProfileDefaults: ({ displayName, githubUser, website, location }, options = {}) =>
        set((state) => {
          const nextProfileDefaults = {
            displayName: normalizeTextValue(displayName) || DEFAULT_PROFILE.displayName,
            githubUser: normalizeTextValue(githubUser) || DEFAULT_PROFILE.githubUser,
            website: normalizeTextValue(website) || DEFAULT_PROFILE.website,
            location: normalizeTextValue(location) || DEFAULT_PROFILE.location,
          }

          const { sections, hasChanges } = applyProfileDefaultsToSections(
            state.sections,
            nextProfileDefaults,
            {
              force: Boolean(options.force),
              previousDisplayName: state.syncedDisplayName,
              previousGithubUser: state.syncedGithubUsername,
              previousWebsite: state.syncedWebsite,
              previousLocation: state.syncedLocation,
            },
          )

          if (
            !hasChanges
            && state.syncedDisplayName === nextProfileDefaults.displayName
            && state.syncedGithubUsername === nextProfileDefaults.githubUser
            && state.syncedWebsite === nextProfileDefaults.website
            && state.syncedLocation === nextProfileDefaults.location
          ) {
            return state
          }

          return {
            sections,
            syncedDisplayName: nextProfileDefaults.displayName,
            syncedGithubUsername: nextProfileDefaults.githubUser,
            syncedWebsite: nextProfileDefaults.website,
            syncedLocation: nextProfileDefaults.location,
          }
        }),
      resetToDefaults: () => {
        const nextProfileDefaults = getActiveProfileDefaults()
        set({
          sections: getDefaultSections(),
          previewTheme: 'dark',
          syncedDisplayName: nextProfileDefaults.displayName,
          syncedGithubUsername: nextProfileDefaults.githubUser,
          syncedWebsite: nextProfileDefaults.website,
          syncedLocation: nextProfileDefaults.location,
        })
      },
    }),
    {
      name: 'readme-builder-store',
      partialize: (state) => ({
        sections: state.sections,
        previewTheme: state.previewTheme,
        syncedDisplayName: state.syncedDisplayName,
        syncedGithubUsername: state.syncedGithubUsername,
        syncedWebsite: state.syncedWebsite,
        syncedLocation: state.syncedLocation,
      }),
      merge: (persistedState, currentState) => {
        const nextState = {
          ...currentState,
          ...(persistedState ?? {}),
        }

        return {
          ...nextState,
          sections: normalizeBuilderSections(nextState.sections ?? currentState.sections),
        }
      },
    },
  ),
)

const SECTION_TITLE_MAP = {
  stats: 'Git Stats',
  badges: 'Badges',
  repos: 'Pinned Repos',
  snippet: 'Quick Info',
  skills: 'Tech Stack',
  socials: 'Socials',
  about: 'About',
}

const SECTION_LABELS = SECTION_LIBRARY.reduce((acc, item) => {
  acc[item.type] = item.label
  return acc
}, {})

const SECTION_DESCRIPTIONS = SECTION_LIBRARY.reduce((acc, item) => {
  acc[item.type] = item.description
  return acc
}, {})

const SECTION_PILL_BASE =
  'inline-flex items-center gap-1 rounded-full border px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.05em]'
const SECTION_PILL_VARIANTS = {
  header: 'text-[#a78bfa] border-[rgba(167,139,250,0.3)] bg-[rgba(167,139,250,0.08)]',
  stats: 'text-[#34d399] border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.08)]',
  streak: 'text-[#f97316] border-[rgba(249,115,22,0.3)] bg-[rgba(249,115,22,0.08)]',
  activity: 'text-[#22d3ee] border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.08)]',
  badges: 'text-[#a855f7] border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.08)]',
  repos: 'text-[#10b981] border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.08)]',
  snippet: 'text-[#ec4899] border-[rgba(236,72,153,0.3)] bg-[rgba(236,72,153,0.08)]',
  skills: 'text-[#fbbf24] border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.08)]',
  socials: 'text-[#60a5fa] border-[rgba(96,165,250,0.3)] bg-[rgba(96,165,250,0.08)]',
  about: 'text-[#f472b6] border-[rgba(244,114,182,0.3)] bg-[rgba(244,114,182,0.08)]',
  text: 'text-[#38bdf8] border-[rgba(56,189,248,0.3)] bg-[rgba(56,189,248,0.08)]',
}
const getSectionPillClass = (type) =>
  `${SECTION_PILL_BASE} ${SECTION_PILL_VARIANTS[type] ?? 'text-zinc-500 border-zinc-800 bg-zinc-900'}`

/* ── Main Component ────────────────────────────────── */
const ReadmeBuilder = ({ activePanel, onOpenProjectModal }) => {
  const navigate = useNavigate()
  const sections = useSectionStore((s) => s.sections)
  const previewTheme = useSectionStore((s) => s.previewTheme)
  const setPreviewTheme = useSectionStore((s) => s.setPreviewTheme)
  const addSection = useSectionStore((s) => s.addSection)
  const removeSection = useSectionStore((s) => s.removeSection)
  const moveSection = useSectionStore((s) => s.moveSection)
  const setSections = useSectionStore((s) => s.setSections)
  const updateSection = useSectionStore((s) => s.updateSection)
  const resetToDefaults = useSectionStore((s) => s.resetToDefaults)
  const syncProfileDefaults = useSectionStore((s) => s.syncProfileDefaults)
  const profileDisplayName = useProfileStore(
    (state) => normalizeTextValue(state.profile.displayName) || DEFAULT_PROFILE.displayName,
  )
  const profileGithubUsername = useProfileStore(
    (state) => normalizeTextValue(state.profile.githubUser) || DEFAULT_PROFILE.githubUser,
  )
  const profileWebsite = useProfileStore(
    (state) => normalizeTextValue(state.profile.website) || DEFAULT_PROFILE.website,
  )
  const profileLocation = useProfileStore(
    (state) => normalizeTextValue(state.profile.location) || DEFAULT_PROFILE.location,
  )

  const markdown = useMemo(() => generateMarkdown(sections), [sections])
  const [isRawMode, setIsRawMode] = useState(false)
  const [rawMarkdown, setRawMarkdown] = useState('')
  const [isRawDirty, setIsRawDirty] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [focusedSectionRequest, setFocusedSectionRequest] = useState(null)
  const [pendingTemplateUpdateId] = useState(() => {
    if (typeof window === 'undefined') return ''

    const raw = window.sessionStorage.getItem(PENDING_TEMPLATE_UPDATE_KEY)
    if (!raw) return ''

    try {
      const parsed = JSON.parse(raw)
      return String(parsed?.templateId ?? '').trim()
    } catch {
      return ''
    }
  })
  const sectionCardRefs = useRef(new Map())

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
      onActivation: ({ event }) => {
        if (event.cancelable) {
          event.preventDefault()
        }
      },
      bypassActivationConstraint({ event, activeNode }) {
        return activeNode.activatorNode.current?.contains(event.target)
      },
    }),
  )
  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeId) ?? null,
    [activeId, sections],
  )
  const focusedSectionId = focusedSectionRequest?.id ?? null
  const previewSections = useMemo(
    () =>
      sections.map((section) => ({
        id: section.id,
        label: SECTION_LABELS[section.type] ?? 'Section',
        markdown: generateMarkdown([section]),
      })),
    [sections],
  )

  useEffect(() => {
    if (activeId) {
      document.body.style.cursor = 'grabbing'
    } else {
      document.body.style.cursor = ''
    }
    return () => {
      document.body.style.cursor = ''
    }
  }, [activeId])

  useEffect(() => {
    if (!isRawDirty) {
      setRawMarkdown(markdown)
    }
  }, [markdown, isRawDirty])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.sessionStorage.getItem(PENDING_TEMPLATE_KEY)
    if (!raw) return
    window.sessionStorage.removeItem(PENDING_TEMPLATE_KEY)

    try {
      const payload = normalizeTemplatePayload(JSON.parse(raw))
      if (!payload.sections.length) return
      setSections(payload.sections)
      syncProfileDefaults(
        {
          displayName: profileDisplayName,
          githubUser: profileGithubUsername,
          website: profileWebsite,
          location: profileLocation,
        },
        { force: true },
      )
      setPreviewTheme(payload.previewTheme)
      toast.success('Template loaded from gallery.')
    } catch {
      // ignore invalid session payload
    }
  }, [
    profileDisplayName,
    profileGithubUsername,
    profileWebsite,
    profileLocation,
    setPreviewTheme,
    setSections,
    syncProfileDefaults,
  ])

  useEffect(() => {
    syncProfileDefaults({
      displayName: profileDisplayName,
      githubUser: profileGithubUsername,
      website: profileWebsite,
      location: profileLocation,
    })
  }, [
    profileDisplayName,
    profileGithubUsername,
    profileWebsite,
    profileLocation,
    syncProfileDefaults,
  ])

  useEffect(() => {
    if (!focusedSectionRequest || typeof window === 'undefined') return undefined

    const isMobileViewport = window.innerWidth < 1024
    if (isMobileViewport && !isEditorOpen) return undefined

    const frameId = window.requestAnimationFrame(() => {
      const target = sectionCardRefs.current.get(focusedSectionRequest.id)
      if (!target) return

      target.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [focusedSectionRequest, isEditorOpen])

  const parseRawToSections = (raw) => {
    const existingByType = new Map()
    sections.forEach((section) => {
      if (!existingByType.has(section.type)) {
        existingByType.set(section.type, section)
      }
    })

    const templateContent = getTemplateContent()

    const baseContent = (type) => {
      const base = existingByType.get(type)?.content ?? templateContent[type] ?? {}
      return clone(base)
    }

    const splitParagraphs = (text) =>
      text
        .split(/\n\s*\n/)
        .map((part) => part.trim())
        .filter(Boolean)

    const parseHeaderMeta = (text) => {
      let location = ''
      let website = ''

      String(text ?? '')
        .split('|')
        .map((part) => part.trim())
        .forEach((part) => {
          const locationMatch = part.match(/^(?:Location:|Based in)\s*(.+)$/i)
          if (locationMatch) location = locationMatch[1].trim()

          const websiteMatch = part.match(
            /<a\s+href="([^"]+)"[^>]*>\s*<img[^>]*>\s*<\/a>|\[!\[[^\]]*\]\([^)]+\)\]\(([^)]+)\)|\[Website\]\(([^)]+)\)/i,
          )
          if (websiteMatch) website = (websiteMatch[1] ?? websiteMatch[2] ?? websiteMatch[3] ?? '').trim()
        })

      return { location, website }
    }

    const parseAlignedAbout = (text) => {
      const matches = Array.from(String(text ?? '').matchAll(/<p\s+([^>]*)>([\s\S]*?)<\/p>/gi))
      if (!matches.length) return null

      const alignMatch = matches[0][1]?.match(/align="(left|center|right)"/i)
      const body = matches
        .map((match) =>
          String(match[2] ?? '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/&nbsp;/gi, ' ')
            .trim(),
        )
        .filter(Boolean)
        .join('\n\n')

      return {
        text: body,
        align: (alignMatch?.[1] ?? 'left').toLowerCase(),
      }
    }

    const parseTextTag = (line) => {
      const match = line.match(/^<(p|h[1-6])\s*([^>]*)>([\s\S]*)<\/\1>\s*$/i)
      if (!match) return null
      const tag = match[1].toLowerCase()
      const attrs = match[2] ?? ''
      const alignMatch = attrs.match(/align="(left|center|right)"/i)
      const dividerMatch = attrs.match(/data-divider="(true|false)"/i)
      const align = (alignMatch?.[1] ?? 'left').toLowerCase()
      const divider = dividerMatch ? dividerMatch[1].toLowerCase() !== 'false' : true
      const text = match[3]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/&nbsp;/gi, ' ')
        .trim()
      return { tag, align, text, divider }
    }

    const collectImageUrls = (value) => {
      const urls = []
      const markdownImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g
      let markdownMatch = markdownImageRegex.exec(value)
      while (markdownMatch) {
        urls.push(markdownMatch[1].trim())
        markdownMatch = markdownImageRegex.exec(value)
      }

      const htmlImageRegex = /<img[^>]*src="([^"]+)"/gi
      let htmlMatch = htmlImageRegex.exec(value)
      while (htmlMatch) {
        urls.push(htmlMatch[1].trim())
        htmlMatch = htmlImageRegex.exec(value)
      }

      return urls
    }

    const parseAlignFromHtml = (value) => {
      const match = String(value ?? '').match(/<(?:div|p)\s+[^>]*align="(left|center|right)"/i)
      return match?.[1]?.toLowerCase() ?? ''
    }

    const parseIconSpacing = (value) => {
      const wrappedMatch = String(value ?? '').match(/<span[^>]*>((?:&nbsp;)+)<\/span>/i)
      if (wrappedMatch) {
        return (wrappedMatch[1].match(/&nbsp;/g) || []).length
      }

      const inlineMatch = String(value ?? '').match(/((?:&nbsp;){1,6})/i)
      return inlineMatch ? (inlineMatch[1].match(/&nbsp;/g) || []).length : undefined
    }

    const collectSkillSlugs = (value) => {
      const urls = collectImageUrls(value)
      const slugs = []

      urls.forEach((urlValue) => {
        try {
          const url = new URL(urlValue)
          const iconQuery = url.searchParams.get('i') ?? ''
          if (!iconQuery) return

          iconQuery
            .split(',')
            .map((slug) => slug.trim().toLowerCase())
            .filter(Boolean)
            .forEach((slug) => slugs.push(slug))
        } catch {
          const match = String(urlValue).match(/(?:cdn\.simpleicons\.org\/|skillicons\.dev\/icons\?i=)([a-z0-9,-]+)/i)
          if (!match) return

          match[1]
            .split(',')
            .map((slug) => slug.trim().toLowerCase())
            .filter(Boolean)
            .forEach((slug) => slugs.push(slug))
        }
      })

      return Array.from(new Set(slugs))
    }

    const applyColorParam = (params, field, key, target) => {
      if (!params.has(key)) return
      const value = params.get(key) ?? ''
      const clean = value.replace('#', '').trim()
      if (clean) target[field] = `#${clean}`
    }

    const applyNumberParam = (params, field, key, target) => {
      if (!params.has(key)) return
      const value = Number(params.get(key))
      if (!Number.isNaN(value)) target[field] = value
    }

    const blocks = []
    let current = { type: 'free', lines: [] }

    const pushCurrent = () => {
      if (current && current.lines.length) {
        blocks.push(current)
      }
      current = null
    }

    const lines = String(raw ?? '').replace(/\r\n/g, '\n').split('\n')
    lines.forEach((line) => {
      const match = line.match(/^(#{1,2})\s+(.*)$/)
      if (match) {
        pushCurrent()
        current = {
          type: 'heading',
          level: match[1].length,
          title: match[2].trim(),
          lines: [],
        }
        return
      }
      const textMatch = parseTextTag(line)
      if (textMatch) {
        pushCurrent()
        blocks.push({ type: 'text', ...textMatch })
        current = { type: 'free', lines: [] }
        return
      }
      if (!current) {
        current = { type: 'free', lines: [] }
      }
      if (current) {
        current.lines.push(line)
      }
    })
    pushCurrent()

    const sectionsOut = []

    const addSectionInt = (type, content) => {
      sectionsOut.push({ id: createId(), type, content })
    }

    const addTextTitle = (title) => {
      const base = baseContent('text')
      addSectionInt('text', {
        ...base,
        text: title,
        size: 'h2',
        align: 'left',
        divider: true,
      })
    }

    const addAboutSection = (heading, text) => {
      const base = baseContent('about')
      const title = heading || 'About'
      if (title) addTextTitle(title)
      addSectionInt('about', {
        ...base,
        text: text ?? '',
      })
    }

    for (let index = 0; index < blocks.length; index += 1) {
      const block = blocks[index]
      if (index === 0 && block.type === 'text' && block.tag === 'h1') {
        const base = baseContent('header')
        let tagline = ''
        let location = ''
        let website = ''
        let consumed = index

        const taglineBlock = blocks[index + 1]
        if (taglineBlock?.type === 'text' && taglineBlock.tag === 'p') {
          tagline = taglineBlock.text.replace(/\n+/g, ' ').trim()
          consumed = index + 1
        }

        const metaBlock = blocks[consumed + 1]
        const metaContent = metaBlock?.type === 'free'
          ? metaBlock.lines.join('\n').trim()
          : ''

        if (metaContent) {
          const parsedMeta = parseHeaderMeta(metaContent)
          location = parsedMeta.location
          website = parsedMeta.website
          if (location || website) consumed += 1
        }

        addSectionInt('header', {
          ...base,
          name: block.text,
          tagline,
          location,
          website,
          align: block.align,
        })
        index = consumed
        continue
      }

      if (block.type === 'text') {
        const base = baseContent('text')
        addSectionInt('text', {
          ...base,
          text: block.text,
          size: block.tag,
          align: block.align,
          divider: block.divider,
        })
        continue
      }

      if (block.type === 'free') {
        const content = block.lines.join('\n').trim()
        if (content) addAboutSection('About', content)
        continue
      }

      const title = block.title.trim()
      const titleLower = title.toLowerCase()
      const content = block.lines.join('\n').trim()

      if (block.level === 1) {
        const paragraphs = splitParagraphs(content)
        const tagline = paragraphs[0] ? paragraphs[0].replace(/\n+/g, ' ').trim() : ''
        const metaText = paragraphs.slice(1).join(' | ')
        const parsedMeta = parseHeaderMeta(metaText)
        const base = baseContent('header')
        addSectionInt('header', {
          ...base,
          name: title,
          tagline,
          location: parsedMeta.location,
          website: parsedMeta.website,
        })
        continue
      }

      if (block.level === 2) {
        if (titleLower === 'stats' || titleLower === 'github stats' || titleLower === 'git stats') {
          addTextTitle(title)
          const base = baseContent('stats')
          const next = {
            ...base,
            showStreakStats: false,
            showActivityGraph: false,
          }
          const imageUrls = collectImageUrls(content)

          const statsUrl = imageUrls.find((urlValue) => {
            const lower = urlValue.toLowerCase()
            return (
              lower.includes('github-readme-stats-delta-eight-12.vercel.app/api')
              && !lower.includes('/api/top-langs')
            )
          })
          const languageUrl = imageUrls.find((urlValue) =>
            urlValue.toLowerCase().includes('github-readme-stats-delta-eight-12.vercel.app/api/top-langs'),
          )
          const streakUrl = imageUrls.find((urlValue) =>
            urlValue.toLowerCase().includes('github-readme-streak-stats.herokuapp.com'),
          )
          const activityUrl = imageUrls.find((urlValue) =>
            urlValue.toLowerCase().includes('github-readme-activity-graph.vercel.app/graph'),
          )
          const trophyUrl = imageUrls.find((urlValue) => {
            const lower = urlValue.toLowerCase()
            return (
              lower.includes('github-profile-trophy.screw-hand.vercel.app')
              || lower.includes('github-profile-trophy-alpha-ecru.vercel.app')
              || lower.includes('github-profile-trophy.vercel.app')
            )
          })
          const hasStatsCardUrl = Boolean(statsUrl || languageUrl)
          const referenceUrl = statsUrl || languageUrl || trophyUrl
          const statsOrderFromMarkdown = normalizeGitStatsOrder(
            imageUrls.flatMap((urlValue) => {
              const lower = urlValue.toLowerCase()
              if (
                lower.includes('github-readme-stats-delta-eight-12.vercel.app/api')
                && !lower.includes('/api/top-langs')
              ) {
                return ['main']
              }
              if (lower.includes('github-readme-stats-delta-eight-12.vercel.app/api/top-langs')) {
                return ['languages']
              }
              if (lower.includes('github-readme-streak-stats.herokuapp.com')) {
                return ['streak']
              }
              if (lower.includes('github-readme-activity-graph.vercel.app/graph')) {
                return ['activity']
              }
              if (
                lower.includes('github-profile-trophy.screw-hand.vercel.app')
                || lower.includes('github-profile-trophy-alpha-ecru.vercel.app')
                || lower.includes('github-profile-trophy.vercel.app')
              ) {
                return ['trophies']
              }
              return []
            }),
          )

          if (statsUrl || languageUrl || streakUrl || activityUrl || trophyUrl) {
            next.showMainStats = Boolean(statsUrl)
            next.showLanguageStats = Boolean(languageUrl)
            next.showStreakStats = Boolean(streakUrl)
            next.showActivityGraph = Boolean(activityUrl)
            next.showTrophyStats = Boolean(trophyUrl)
            next.statsOrder = statsOrderFromMarkdown
          }

          if (referenceUrl) {
            try {
              const url = new URL(referenceUrl)
              const params = url.searchParams
              if (params.has('username')) next.username = params.get('username') ?? ''
              if (hasStatsCardUrl) {
                if (params.has('theme')) next.theme = params.get('theme') ?? ''
                if (params.has('show_icons')) next.showIcons = params.get('show_icons') === 'true'
                if (params.has('hide_border')) next.hideBorder = params.get('hide_border') === 'true'
                if (params.has('include_all_commits'))
                  next.includeAllCommits = params.get('include_all_commits') === 'true'
                if (params.has('count_private'))
                  next.countPrivate = params.get('count_private') === 'true'
                if (params.has('rank_icon')) next.rankIcon = params.get('rank_icon') ?? ''
                applyColorParam(params, 'bgColor', 'bg_color', next)
                applyColorParam(params, 'titleColor', 'title_color', next)
                applyColorParam(params, 'textColor', 'text_color', next)
                applyColorParam(params, 'iconColor', 'icon_color', next)
                applyNumberParam(params, 'borderRadius', 'border_radius', next)
                applyNumberParam(params, 'cardWidth', 'card_width', next)
                applyNumberParam(params, 'lineHeight', 'line_height', next)
              }
            } catch {
              // Ignore invalid Reference URLs
            }
          }

          if (streakUrl) {
            try {
              const url = new URL(streakUrl)
              const params = url.searchParams
              if (params.has('user')) next.username = params.get('user') ?? next.username
              if (params.has('theme')) next.streakTheme = params.get('theme') ?? ''
              if (params.has('hide_border')) next.streakHideBorder = params.get('hide_border') === 'true'
              applyColorParam(params, 'streakBgColor', 'background', next)
              applyColorParam(params, 'streakStrokeColor', 'stroke', next)
              applyColorParam(params, 'streakRingColor', 'ring', next)
              applyColorParam(params, 'streakFireColor', 'fire', next)
              applyColorParam(params, 'streakCurrStreakColor', 'currStreakNum', next)
              applyColorParam(params, 'streakSideNumColor', 'sideNums', next)
              applyColorParam(params, 'streakSideLabelsColor', 'sideLabels', next)
              applyColorParam(params, 'streakDateColor', 'dates', next)
              applyNumberParam(params, 'streakBorderRadius', 'border_radius', next)
            } catch {
              // Ignore invalid streak URLs
            }
          }

          if (activityUrl) {
            try {
              const url = new URL(activityUrl)
              const params = url.searchParams
              if (params.has('username')) next.username = params.get('username') ?? next.username
              if (params.has('theme')) next.activityTheme = params.get('theme') ?? ''
              if (params.has('hide_border')) next.activityHideBorder = params.get('hide_border') === 'true'
              if (params.has('hide_grid')) next.activityHideGrid = params.get('hide_grid') === 'true'
              if (params.has('area')) next.activityShowArea = params.get('area') === 'true'
              applyColorParam(params, 'activityBgColor', 'bg_color', next)
              applyColorParam(params, 'activityLineColor', 'line', next)
              applyColorParam(params, 'activityPointColor', 'point', next)
              applyColorParam(params, 'activityAreaColor', 'area_color', next)
              applyNumberParam(params, 'activityRadius', 'radius', next)
            } catch {
              // Ignore invalid activity URLs
            }
          }

          addSectionInt('stats', next)
          continue
        }

        if (titleLower === 'streak stats') {
          addTextTitle(title)
          const base = baseContent('streak')
          const next = { ...base }
          const streakUrl = collectImageUrls(content).find((urlValue) =>
            urlValue.toLowerCase().includes('github-readme-streak-stats.herokuapp.com'),
          )

          if (streakUrl) {
            try {
              const url = new URL(streakUrl)
              const params = url.searchParams
              if (params.has('user')) next.username = params.get('user') ?? ''
              if (params.has('theme')) next.theme = params.get('theme') ?? ''
              if (params.has('hide_border')) next.hideBorder = params.get('hide_border') === 'true'
              applyColorParam(params, 'bgColor', 'background', next)
              applyColorParam(params, 'strokeColor', 'stroke', next)
              applyColorParam(params, 'ringColor', 'ring', next)
              applyColorParam(params, 'fireColor', 'fire', next)
              applyColorParam(params, 'currStreakColor', 'currStreakNum', next)
              applyColorParam(params, 'sideNumColor', 'sideNums', next)
              applyColorParam(params, 'sideLabelsColor', 'sideLabels', next)
              applyColorParam(params, 'dateColor', 'dates', next)
              applyNumberParam(params, 'borderRadius', 'border_radius', next)
            } catch {
              // Ignore invalid streak URLs
            }
          }

          addSectionInt('streak', next)
          continue
        }

        if (titleLower === 'activity graph') {
          addTextTitle(title)
          const base = baseContent('activity')
          const next = { ...base }
          const activityUrl = collectImageUrls(content).find((urlValue) =>
            urlValue.toLowerCase().includes('github-readme-activity-graph.vercel.app/graph'),
          )

          if (activityUrl) {
            try {
              const url = new URL(activityUrl)
              const params = url.searchParams
              if (params.has('username')) next.username = params.get('username') ?? ''
              if (params.has('theme')) next.theme = params.get('theme') ?? ''
              if (params.has('hide_border')) next.hideBorder = params.get('hide_border') === 'true'
              if (params.has('hide_grid')) next.hideGrid = params.get('hide_grid') === 'true'
              if (params.has('area')) next.area = params.get('area') === 'true'
              applyColorParam(params, 'bgColor', 'bg_color', next)
              applyColorParam(params, 'lineColor', 'line', next)
              applyColorParam(params, 'pointColor', 'point', next)
              applyColorParam(params, 'areaColor', 'area_color', next)
              applyNumberParam(params, 'radius', 'radius', next)
            } catch {
              // Ignore invalid activity URLs
            }
          }

          addSectionInt('activity', next)
          continue
        }

        if (titleLower === 'tech stack' || titleLower === 'skills' || titleLower === 'skills icons') {
          addTextTitle(title)
          const base = baseContent('skills')
          const unique = collectSkillSlugs(content)
          const sizeMatch = content.match(/<img[^>]*(?:width|height)="(\d+)"/i)
          const spacing = parseIconSpacing(content)
          const align = parseAlignFromHtml(content)
          addSectionInt('skills', {
            ...base,
            items: unique,
            ...(sizeMatch ? { iconSize: Number(sizeMatch[1]) } : {}),
            ...(typeof spacing === 'number' ? { iconSpacing: spacing } : {}),
            ...(align ? { align } : {}),
          })
          continue
        }

        if (titleLower === 'socials' || titleLower === 'social links') {
          addTextTitle(title)
          const base = baseContent('socials')
          const links = []
          const iconRegex = /<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?(?:cdn\.simpleicons\.org\/|skillicons\.dev\/icons\?i=)([a-z0-9-]+)[^"]*"[^>]*>[\s\S]*?<\/a>/gi
          let match = iconRegex.exec(content)
          while (match) {
            links.push({ label: match[2].trim(), slug: match[2].trim(), url: match[1].trim() })
            match = iconRegex.exec(content)
          }
          if (!links.length) {
            const regex = /-\s*\[([^\]]+)\]\(([^)]+)\)/g
            let listMatch = regex.exec(content)
            while (listMatch) {
              links.push({ label: listMatch[1].trim(), url: listMatch[2].trim() })
              listMatch = regex.exec(content)
            }
          }
          const sizeMatch = content.match(/<img[^>]*width="(\d+)"/i)
          const spacing = parseIconSpacing(content)
          const align = parseAlignFromHtml(content)
          addSectionInt('socials', {
            ...base,
            links,
            ...(sizeMatch ? { iconSize: Number(sizeMatch[1]) } : {}),
            ...(typeof spacing === 'number' ? { iconSpacing: spacing } : {}),
            ...(align ? { align } : {}),
          })
          continue
        }

        const alignedAbout = parseAlignedAbout(content)
        const base = baseContent('about')
        const titleText = title || 'About'
        if (titleText) addTextTitle(titleText)
        addSectionInt('about', {
          ...base,
          text: alignedAbout?.text ?? content,
          align: alignedAbout?.align ?? base.align ?? 'left',
        })
        continue
      }

      addAboutSection(title || 'About', content)
    }

    return sectionsOut
  }

  const handleDragStart = (e) => setActiveId(e.active.id)
  const handleDragEnd = (e) => {
    if (e.over && e.active.id !== e.over.id) moveSection(e.active.id, e.over.id)
    setActiveId(null)
  }
  const handleDragCancel = () => setActiveId(null)

  const handleRawChange = (event) => {
    const next = event.target.value
    setRawMarkdown(next)
    setIsRawDirty(next !== markdown)
    setSections(parseRawToSections(next))
  }

  const handleCopyMarkdown = async () => {
    if (!navigator.clipboard?.writeText) {
      toast.error('Clipboard not available.')
      return
    }
    try {
      const output = isRawDirty ? rawMarkdown : markdown
      await navigator.clipboard.writeText(output)
      toast.success('Markdown copied to clipboard!')
    } catch {
      toast.error('Copy failed. Try again.')
    }
  }

  const handleResetDefaults = () => {
    resetToDefaults()
    setIsRawDirty(false)
    setIsRawMode(false)
    toast.success('Defaults template restored.')
  }

  const handleQuickStart = () => {
    resetToDefaults()
    toast.success('Template loaded!')
  }

  const handleSaveTemplate = () => {
    if (pendingTemplateUpdateId) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(PENDING_TEMPLATE_UPDATE_KEY)
      }

      navigate(`/templates?update=${encodeURIComponent(pendingTemplateUpdateId)}`)
      return
    }

    navigate('/templates?create=1')
  }

  const registerSectionCardRef = (sectionId) => (node) => {
    if (node) {
      sectionCardRefs.current.set(sectionId, node)
      return
    }

    sectionCardRefs.current.delete(sectionId)
  }

  const handlePreviewSectionSelect = (sectionId) => {
    setFocusedSectionRequest({
      id: sectionId,
      signal: Date.now(),
    })

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsEditorOpen(true)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <Navbar
        onReset={handleResetDefaults}
        onCopy={handleCopyMarkdown}
        onOpenProjectModal={onOpenProjectModal}
        onSaveTemplate={handleSaveTemplate}
        saveTemplateLabel={pendingTemplateUpdateId ? 'Update Template' : 'Save Template'}
      />

      <div
        className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[400px_1fr]"
      >
        {/* ── Builder Column ─────────────────── */}
        <div
          className={`relative border-b border-zinc-800 ${isEditorOpen ? 'block' : 'hidden'} lg:block lg:sticky lg:top-12.25 lg:h-[calc(100vh-49px)] lg:overflow-y-auto lg:border-b-0 lg:border-r [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700`}
        >
          <div className="p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <span className={labelClass}>Template Editor</span>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500 transition-all duration-150 hover:border-zinc-700 hover:text-zinc-300 cursor-pointer select-none"
              >
                Back to Preview
              </button>
            </div>
            {/* Add Section Panel */}
            <div className="mb-5">
              <div className="mb-3">
                <p className={labelClass}>Add Section</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Choose a template to insert.
                </p>
              </div>
              <div className="grid gap-1.5">
                {SECTION_LIBRARY.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      addSection(item.type)
                      toast.success(`${item.label} section added.`)
                    }}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-left transition-all duration-150 hover:border-zinc-700 hover:bg-[#1e1e22] cursor-pointer"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-zinc-50">
                        {item.label}
                      </p>
                      <p className="mt-px text-[11px] text-zinc-600">
                        {item.description}
                      </p>
                    </div>
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-zinc-500"
                    >
                      <Plus size={14} />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div
              className="mb-5 h-px bg-zinc-800"
            />

            {/* Active Sections */}
            <div>
              <div className="mb-3">
                <p className={labelClass}>Active Sections</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Drag to reorder · Expand to edit.
                </p>
              </div>

              {sections.length === 0 ? (
                <EmptyState onQuickStart={handleQuickStart} />
              ) : (
                <div className="flex flex-col gap-2">
<DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                    <SortableContext
                      items={sections.map((s) => s.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <AnimatePresence mode="popLayout">
                        {sections.map((section) => (
                          <SortableSectionCard
                            key={section.id}
                            id={section.id}
                            title={SECTION_LABELS[section.type]}
                            description={SECTION_DESCRIPTIONS[section.type]}
                            pillLabel={section.type}
                            pillClass={getSectionPillClass(section.type)}
                            containerRef={registerSectionCardRef(section.id)}
                            highlightSignal={focusedSectionId === section.id ? focusedSectionRequest?.signal ?? 0 : 0}
                            isHighlighted={focusedSectionId === section.id}
                          >
                            <div className="mb-3 flex justify-end">
                              <button
                                type="button"
                                onClick={() => removeSection(section.id)}
                                className="flex items-center gap-1 rounded-md border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.12)] px-2.5 py-1 text-[11px] font-semibold text-red-500 transition-all duration-150 cursor-pointer select-none"
                              >
                                <Trash2 size={12} />
                                Remove
                              </button>
                            </div>
                            <SectionEditor
                              section={section}
                              updateSection={updateSection}
                              techOptions={TECH_OPTIONS}
                              socialOptions={SOCIAL_OPTIONS}
                              fallbackIcon={FALLBACK_ICON}
                              buildStatsUrl={buildStatsUrl}
                            />
                          </SortableSectionCard>
                        ))}
                      </AnimatePresence>
                    </SortableContext>
                    <DragOverlay dropAnimation={null}>
                      {activeSection ? (
                        <DragPreview
                          title={SECTION_LABELS[activeSection.type]}
                          pillLabel={activeSection.type}
                          pillClass={getSectionPillClass(activeSection.type)}
                        />
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Preview Column ─────────────────── */}
        <div
          className={`relative bg-zinc-950 ${isEditorOpen ? 'hidden' : 'block'} lg:block lg:sticky lg:top-12.25 lg:h-[calc(100vh-49px)] lg:overflow-y-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700`}
        >
          <div className="p-4 sm:p-5">
          {/* Preview Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            
            {/* Left Side: Status Indicator */}
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-green-500 animate-pulse" />
              <span className={labelClass}>Preview</span>
              <span className="text-[11px] text-zinc-600">· Live</span>
            </div>

            {/* Right Side: Action Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Mode Switcher */}
              <div className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950 p-0.5">
                <button
                  type="button"
                  onClick={() => setIsRawMode(false)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all sm:text-[11px] select-none cursor-pointer ${
                    !isRawMode ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => setIsRawMode(true)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all sm:text-[11px] select-none cursor-pointer ${
                    isRawMode ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Raw
                </button>
              </div>

              {/* Mobile Edit Button - Uses Icon on small screens, Text on slightly larger */}
              <button
                type="button"
                onClick={() => setIsEditorOpen(true)}
                className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 transition-all hover:border-zinc-700 hover:text-zinc-300 lg:hidden"
              >
                <Sparkles size={14} className="text-blue-500" />
                <span className="hidden xs:inline">Edit Template</span>
              </button>

              <GithubModeToggle
                previewTheme={previewTheme}
                onChange={setPreviewTheme}
              />
            </div>
          </div>

          {/* Preview Pane */}
          {isRawMode ? (
              <textarea
                value={rawMarkdown}
                onChange={handleRawChange}
                spellCheck={false}
                className={`${inputClass} h-[60vh] lg:h-screen resize-y font-mono text-[12px] sm:text-[13px]`}
              />
            ) : (
              <Preview
                markdown={markdown}
                previewTheme={previewTheme}
                interactiveSections={previewSections}
                onSectionSelect={handlePreviewSectionSelect}
              />
            )}
          </div>
        </div>
      </div>

      {isEditorOpen && (
        <button
          type="button"
          onClick={() => setIsEditorOpen(false)}
          className="fixed bottom-16 left-3 z-40 rounded-full border border-zinc-800 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-150 hover:border-zinc-700 lg:hidden cursor-pointer select-none"
        >
          Back to Preview
        </button>
      )}

      {/* Floating Feedback Button */}
      <button
        onClick={() => setIsFeedbackOpen(true)}
        className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-emerald-500 shadow-2xl transition-all hover:scale-110 hover:border-emerald-500/50 hover:bg-emerald-500/10 cursor-pointer tooltip tooltip-left before:text-[11px] before:font-medium"
        data-tip="Give Feedback"
      >
        <MessageSquare size={20} />
      </button>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  )
}

export default ReadmeBuilder

import React, { useEffect, useMemo, useState } from 'react'
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
import { PENDING_TEMPLATE_KEY } from '../constants/templateFlow'
import { normalizeTemplatePayload } from '../utils/templatePayload'
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

/* ── Template Content ──────────────────────────────── */
const TEMPLATE_CONTENT = {
  header: {
    name: 'Brandon Developer',
    tagline: 'Designing developer experiences that ship.',
    location: 'Yangon, Myanmar',
    website: 'https://brandondevme.vercel.app',
  },
  about: {
    text: 'I build clean, fast developer tooling with a focus on UX and performance.',
  },
  stats: {
    username: 'BrandonBlkk',
    theme: 'transparent',
    showMainStats: true,
    showLanguageStats: true,
    showTrophyStats: true,
    showIcons: true,
    hideBorder: true,
    includeAllCommits: false,
    countPrivate: false,
    rankIcon: 'github',
    bgColor: '#0d1117',
    titleColor: '#58a6ff',
    textColor: '#c9d1d9',
    iconColor: '#58a6ff',
    borderRadius: 8,
    cardWidth: 420,
    lineHeight: 28,
  },
  skills: {
    items: ['react', 'typescript', 'tailwindcss', 'vite', 'nodedotjs'],
    iconSize: 40,
  },
  socials: {
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

const SECTION_LIBRARY = [
  { type: 'header', label: 'Header', description: 'Name, tagline, and key links.' },
  { type: 'about', label: 'About', description: 'Short bio or mission statement.' },
  { type: 'stats', label: 'GitHub Stats', description: 'Live stats card with theming controls.' },
  { type: 'skills', label: 'Skills Icons', description: 'Simple Icons tech stack strip.' },
  { type: 'socials', label: 'Social Links', description: 'Primary links and profiles.' },
  { type: 'text', label: 'Text Block', description: 'Custom text with size and alignment.' },
]

const createSection = (type) => ({
  id: createId(),
  type,
  content: clone(TEMPLATE_CONTENT[type] ?? {}),
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
  createTextTitleSection('Stats'),
  createSection('stats'),
  createTextTitleSection('Tech Stack'),
  createSection('skills'),
  createTextTitleSection('Socials'),
  createSection('socials'),
]

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
      setPreviewTheme: (theme) => set({ previewTheme: theme }),
      addSection: (type) =>
        set((state) => ({
          sections: [
            ...state.sections,
            ...(SECTION_TITLE_MAP[type]
              ? [createTextTitleSection(SECTION_TITLE_MAP[type])]
              : []),
            createSection(type),
          ],
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
      setSections: (sections) => set({ sections }),
      moveSection: (activeId, overId) => {
        const { sections } = get()
        const fromIndex = sections.findIndex((section) => section.id === activeId)
        const toIndex = sections.findIndex((section) => section.id === overId)
        if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return
        set({ sections: moveItem(sections, fromIndex, toIndex) })
      },
      resetToDefaults: () => set({ sections: getDefaultSections(), previewTheme: 'dark' }),
    }),
    {
      name: 'readme-builder-store',
      partialize: (state) => ({
        sections: state.sections,
        previewTheme: state.previewTheme,
      }),
    },
  ),
)

const SECTION_TITLE_MAP = {
  stats: 'Stats',
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

  const markdown = useMemo(() => generateMarkdown(sections), [sections])
  const [isRawMode, setIsRawMode] = useState(false)
  const [rawMarkdown, setRawMarkdown] = useState('')
  const [isRawDirty, setIsRawDirty] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  )
  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeId) ?? null,
    [activeId, sections],
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
      setPreviewTheme(payload.previewTheme)
      toast.success('Template loaded from gallery.')
    } catch {
      // ignore invalid session payload
    }
  }, [setPreviewTheme, setSections])

  const parseRawToSections = (raw) => {
    // This part is a bit complex but we reuse the logic from the original file
    // For brevity in this replacement, I'll keep the core structure
    const existingByType = new Map()
    sections.forEach((section) => {
      if (!existingByType.has(section.type)) {
        existingByType.set(section.type, section)
      }
    })

    const baseContent = (type) => {
      const base = existingByType.get(type)?.content ?? TEMPLATE_CONTENT[type] ?? {}
      return clone(base)
    }

    const splitParagraphs = (text) =>
      text
        .split(/\n\s*\n/)
        .map((part) => part.trim())
        .filter(Boolean)

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

    blocks.forEach((block) => {
      if (block.type === 'text') {
        const base = baseContent('text')
        addSectionInt('text', {
          ...base,
          text: block.text,
          size: block.tag,
          align: block.align,
          divider: block.divider,
        })
        return
      }

      if (block.type === 'free') {
        const content = block.lines.join('\n').trim()
        if (content) addAboutSection('About', content)
        return
      }

      const title = block.title.trim()
      const titleLower = title.toLowerCase()
      const content = block.lines.join('\n').trim()

      if (block.level === 1) {
        const paragraphs = splitParagraphs(content)
        const tagline = paragraphs[0] ? paragraphs[0].replace(/\n+/g, ' ').trim() : ''
        const metaText = paragraphs.slice(1).join(' | ')
        let location = ''
        let website = ''
        if (metaText) {
          metaText.split('|').map((p) => p.trim()).forEach((p) => {
            const lMatch = p.match(/^Location:\s*(.+)$/i)
            if (lMatch) location = lMatch[1].trim()
            const wMatch = p.match(/\[Website\]\(([^)]+)\)/i)
            if (wMatch) website = wMatch[1].trim()
          })
        }
        addSectionInt('header', {
          name: title,
          tagline,
          location,
          website,
        })
        return
      }

      if (block.level === 2) {
        if (titleLower === 'stats' || titleLower === 'github stats') {
          addTextTitle(title)
          const base = baseContent('stats')
          const next = { ...base }
          const imageUrls = []
          const markdownImageRegex = /!\[[^\]]*\]\(([^)]+)\)/g
          let markdownMatch = markdownImageRegex.exec(content)
          while (markdownMatch) {
            imageUrls.push(markdownMatch[1].trim())
            markdownMatch = markdownImageRegex.exec(content)
          }
          const htmlImageRegex = /<img[^>]*src="([^"]+)"/gi
          let htmlMatch = htmlImageRegex.exec(content)
          while (htmlMatch) {
            imageUrls.push(htmlMatch[1].trim())
            htmlMatch = htmlImageRegex.exec(content)
          }

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

          if (statsUrl || languageUrl || trophyUrl) {
            next.showMainStats = Boolean(statsUrl)
            next.showLanguageStats = Boolean(languageUrl)
            next.showTrophyStats = Boolean(trophyUrl)
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

                const applyColor = (field, key) => {
                  if (!params.has(key)) return
                  const value = params.get(key) ?? ''
                  const clean = value.replace('#', '').trim()
                  if (clean) next[field] = `#${clean}`
                }
                applyColor('bgColor', 'bg_color')
                applyColor('titleColor', 'title_color')
                applyColor('textColor', 'text_color')
                applyColor('iconColor', 'icon_color')

                const applyNumber = (field, key) => {
                  if (!params.has(key)) return
                  const value = Number(params.get(key))
                  if (!Number.isNaN(value)) next[field] = value
                }
                applyNumber('borderRadius', 'border_radius')
                applyNumber('cardWidth', 'card_width')
                applyNumber('lineHeight', 'line_height')
              }
            } catch {
              // Ignore invalid Reference URLs
            }
          }
          addSectionInt('stats', next)
          return
        }

        if (titleLower === 'tech stack' || titleLower === 'skills' || titleLower === 'skills icons') {
          addTextTitle(title)
          const base = baseContent('skills')
          const slugMatches = []
          const regex = /cdn\.simpleicons\.org\/([a-z0-9-]+)/gi
          let match = regex.exec(content)
          while (match) {
            slugMatches.push(match[1])
            match = regex.exec(content)
          }
          const unique = Array.from(new Set(slugMatches))
          addSectionInt('skills', { ...base, items: unique })
          return
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
          addSectionInt('socials', { ...base, links })
          return
        }

        addAboutSection(title || 'About', content)
        return
      }

      addAboutSection(title || 'About', content)
    })

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
    navigate('/templates?create=1')
  }

  return (
    <div className="flex flex-1 flex-col">
      <Navbar
        onReset={handleResetDefaults}
        onCopy={handleCopyMarkdown}
        onOpenProjectModal={onOpenProjectModal}
        onSaveTemplate={handleSaveTemplate}
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
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all sm:text-[11px] select-none ${
                    !isRawMode ? 'bg-zinc-800 text-zinc-50' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => setIsRawMode(true)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all sm:text-[11px] select-none ${
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
                markdown={isRawDirty ? rawMarkdown : markdown}
                previewTheme={previewTheme}
              />
            )}
          </div>
        </div>
      </div>

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

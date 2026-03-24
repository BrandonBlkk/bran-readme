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
import Navbar from './Navbar'
import { Plus, Trash2, Sparkles } from 'lucide-react'
import { techData } from '../utils/tech-data'
import { labelClass, inputClass } from './readme-builder/FormFields'
import SectionEditor from './readme-builder/SectionEditor'
import Preview from './readme-builder/Preview'
import SortableSectionCard from './readme-builder/SortableSectionCard'
import DragPreview from './readme-builder/DragPreview'
import EmptyState from './readme-builder/EmptyState'
import GithubModeToggle from './readme-builder/GithubModeToggle'

const FALLBACK_ICON =
  'data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23999\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><path d=\"M8 12h8\"/></svg>'

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
    name: 'Jane Developer',
    tagline: 'Designing developer experiences that ship.',
    location: 'San Francisco, CA',
    website: 'https://janedeveloper.dev',
  },
  stats: {
    username: 'octocat',
    theme: 'transparent',
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
      { label: 'GitHub', url: 'https://github.com/username' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/username' },
      { label: 'X (Twitter)', url: 'https://x.com/username' },
      { label: 'Website', url: 'https://username.dev' },
    ],
  },
  about: {
    heading: 'About',
    text: 'I build clean, fast developer tooling with a focus on UX and performance.',
  },
}

const SECTION_LIBRARY = [
  { type: 'header', label: 'Header', description: 'Name, tagline, and key links.' },
  { type: 'stats', label: 'GitHub Stats', description: 'Live stats card with theming controls.' },
  { type: 'skills', label: 'Skills Icons', description: 'Simple Icons tech stack strip.' },
  { type: 'socials', label: 'Social Links', description: 'Primary links and profiles.' },
  { type: 'about', label: 'Text / About', description: 'Short bio or mission statement.' },
]

const createSection = (type) => ({
  id: createId(),
  type,
  content: clone(TEMPLATE_CONTENT[type] ?? {}),
})

const getDefaultSections = () => [
  createSection('header'),
  createSection('stats'),
  createSection('skills'),
  createSection('socials'),
  createSection('about'),
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
          sections: [...state.sections, createSection(type)],
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

/* ── Tech Icons ────────────────────────────────────── */
const TECH_OPTIONS = techData.map((icon) => ({
  title: icon.name,
  slug: icon.slug,
  category: icon.category,
}))

const TECH_ICON_MAP = TECH_OPTIONS.reduce((acc, icon) => {
  acc[icon.slug] = icon
  return acc
}, {})

const SKILLICONS_OVERRIDES = {
  javascript: 'js',
  typescript: 'ts',
  cplusplus: 'cpp',
  csharp: 'cs',
  gnubash: 'bash',
  postgresql: 'postgres',
  rubyonrails: 'rails',
  tailwindcss: 'tailwind',
  nodedotjs: 'nodejs',
  nextdotjs: 'nextjs',
  nuxtdotjs: 'nuxtjs',
  vuedotjs: 'vue',
  rollupdotjs: 'rollup',
}

const toSkillIconsSlug = (value) => {
  const slug = String(value ?? '')
  if (!slug) return ''
  if (SKILLICONS_OVERRIDES[slug]) return SKILLICONS_OVERRIDES[slug]
  if (slug.endsWith('dotjs')) return slug.replace(/dotjs$/, 'js')
  return slug
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
}
const getSectionPillClass = (type) =>
  `${SECTION_PILL_BASE} ${SECTION_PILL_VARIANTS[type] ?? 'text-zinc-500 border-zinc-800 bg-zinc-900'}`

const sanitizeHex = (value) => String(value ?? '').replace('#', '').trim()

/* ── Markdown Generators ───────────────────────────── */
const buildStatsUrl = (content) => {
  const url = new URL('https://github-readme-stats.vercel.app/api')
  if (content.username) url.searchParams.set('username', content.username)
  if (content.theme) url.searchParams.set('theme', content.theme)
  if (content.showIcons) url.searchParams.set('show_icons', 'true')
  if (content.hideBorder) url.searchParams.set('hide_border', 'true')
  if (content.includeAllCommits) url.searchParams.set('include_all_commits', 'true')
  if (content.countPrivate) url.searchParams.set('count_private', 'true')
  if (content.rankIcon && content.rankIcon !== 'none')
    url.searchParams.set('rank_icon', content.rankIcon)
  if (content.bgColor) url.searchParams.set('bg_color', sanitizeHex(content.bgColor))
  if (content.titleColor) url.searchParams.set('title_color', sanitizeHex(content.titleColor))
  if (content.textColor) url.searchParams.set('text_color', sanitizeHex(content.textColor))
  if (content.iconColor) url.searchParams.set('icon_color', sanitizeHex(content.iconColor))
  if (content.borderRadius !== undefined)
    url.searchParams.set('border_radius', String(content.borderRadius))
  if (content.cardWidth) url.searchParams.set('card_width', String(content.cardWidth))
  if (content.lineHeight) url.searchParams.set('line_height', String(content.lineHeight))
  return url.toString()
}

const headerBlock = (c) => {
  const lines = []
  if (c.name) lines.push(`# ${c.name}`)
  if (c.tagline) lines.push(c.tagline)
  const meta = []
  if (c.location) meta.push(`Location: ${c.location}`)
  if (c.website) meta.push(`[Website](${c.website})`)
  if (meta.length) lines.push(meta.join(' | '))
  return lines.join('\n\n')
}

const statsBlock = (c) => `## Stats\n\n![GitHub Stats](${buildStatsUrl(c)})`

const skillsBlock = (c) => {
  const items = (c.items ?? [])
    .map((slug) => TECH_ICON_MAP[slug] ?? { title: slug, slug })
    .filter(Boolean)
  if (!items.length) return '## Tech Stack\n\nAdd your tech stack icons.'
  const iconSize = Number(c.iconSize ?? 40) || 40
  const icons = items
    .map((icon) => {
      const slug = toSkillIconsSlug(icon.slug)
      const src = slug
        ? `https://skillicons.dev/icons?i=${slug}&theme=dark`
        : FALLBACK_ICON
      return `<img src="${src}" alt="${icon.title}" width="${iconSize}" height="${iconSize}" />`
    })
    .join('&nbsp;&nbsp;')
  return `## Tech Stack\n\n${icons}`
}

const socialsBlock = (c) => {
  const links = (c.links ?? []).filter((l) => l.label && l.url)
  if (!links.length) return '## Socials\n\nAdd your social links.'
  return `## Socials\n\n${links.map((l) => `- [${l.label}](${l.url})`).join('\n')}`
}

const aboutBlock = (c) => {
  if (!c.text) return ''
  return `## ${c.heading || 'About'}\n\n${c.text}`
}

const generateMarkdown = (sections) =>
  sections
    .map((s) => {
      const c = s.content ?? {}
      switch (s.type) {
        case 'header': return headerBlock(c)
        case 'stats': return statsBlock(c)
        case 'skills': return skillsBlock(c)
        case 'socials': return socialsBlock(c)
        case 'about': return aboutBlock(c)
        default: return ''
      }
    })
    .filter(Boolean)
    .join('\n\n')

/* ── Main Component ────────────────────────────────── */
const ReadmeBuilder = ({ activePanel, onOpenProjectModal }) => {
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

  const parseRawToSections = (raw) => {
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

    const blocks = []
    let current = null
    const preamble = []

    const pushCurrent = () => {
      if (current) {
        blocks.push(current)
        current = null
      }
    }

    const lines = String(raw ?? '').replace(/\r\n/g, '\n').split('\n')
    lines.forEach((line) => {
      const match = line.match(/^(#{1,2})\s+(.*)$/)
      if (match) {
        pushCurrent()
        current = { level: match[1].length, title: match[2].trim(), lines: [] }
        return
      }
      if (current) {
        current.lines.push(line)
      } else {
        preamble.push(line)
      }
    })
    pushCurrent()

    const sectionsOut = []

    const addSection = (type, content) => {
      sectionsOut.push({ id: createId(), type, content })
    }

    const addAboutSection = (heading, text) => {
      const base = baseContent('about')
      addSection('about', {
        ...base,
        heading: heading || base.heading || 'About',
        text: text ?? '',
      })
    }

    const preambleText = preamble.join('\n').trim()
    if (preambleText) {
      addAboutSection('About', preambleText)
    }

    blocks.forEach((block) => {
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
          metaText.split('|').map((part) => part.trim()).forEach((part) => {
            const locationMatch = part.match(/^Location:\s*(.+)$/i)
            if (locationMatch) location = locationMatch[1].trim()
            const websiteMatch = part.match(/\[Website\]\(([^)]+)\)/i)
            if (websiteMatch) website = websiteMatch[1].trim()
          })
        }
        addSection('header', {
          name: title,
          tagline,
          location,
          website,
        })
        return
      }

      if (block.level === 2) {
        if (titleLower === 'stats' || titleLower === 'github stats') {
          const base = baseContent('stats')
          const next = { ...base }
          const imageMatch = content.match(/!\[[^\]]*\]\(([^)]+)\)/)
          if (imageMatch) {
            try {
              const url = new URL(imageMatch[1])
              const params = url.searchParams
              if (params.has('username')) next.username = params.get('username') ?? ''
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
            } catch {
              // Keep base stats if URL parsing fails.
            }
          }
          addSection('stats', next)
          return
        }

        if (titleLower === 'tech stack' || titleLower === 'skills' || titleLower === 'skills icons') {
          const base = baseContent('skills')
          const slugMatches = []
          const regex = /cdn\.simpleicons\.org\/([a-z0-9-]+)/gi
          let match = regex.exec(content)
          while (match) {
            slugMatches.push(match[1])
            match = regex.exec(content)
          }
          const unique = Array.from(new Set(slugMatches))
          addSection('skills', { ...base, items: unique })
          return
        }

        if (titleLower === 'socials' || titleLower === 'social links') {
          const base = baseContent('socials')
          const links = []
          const regex = /-\s*\[([^\]]+)\]\(([^)]+)\)/g
          let match = regex.exec(content)
          while (match) {
            links.push({ label: match[1].trim(), url: match[2].trim() })
            match = regex.exec(content)
          }
          addSection('socials', { ...base, links })
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

  return (
    <div className="flex flex-1 flex-col">
      <Navbar
        onReset={handleResetDefaults}
        onCopy={handleCopyMarkdown}
        onOpenProjectModal={onOpenProjectModal}
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
                      <AnimatePresence>
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
    </div>
  )
}

export default ReadmeBuilder

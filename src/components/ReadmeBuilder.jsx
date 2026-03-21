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
import {
  SortableContext,
  defaultAnimateLayoutChanges,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { toast, Toaster } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import {
  ChevronDown,
  GripVertical,
  Moon,
  Plus,
  Sun,
  Trash2,
  FileText,
  Sparkles,
} from 'lucide-react'
import { techData } from '../utils/tech-data'

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
    includeAllCommits: true,
    countPrivate: true,
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
    iconSize: 26,
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
  const icons = items
    .map((icon) => {
      const src = icon.slug
        ? `https://cdn.simpleicons.org/${icon.slug}`
        : FALLBACK_ICON
      return `<img src="${src}" alt="${icon.title}" />`
    })
    .join(' ')
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

/* ── Shared Styles ─────────────────────────────────── */
const labelClass =
  'text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500'
const inputClass =
  'w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-[13px] font-mono text-zinc-50 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15'

/* ── Form Components ───────────────────────────────── */
const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className={`mb-1.5 block ${labelClass}`}>{label}</span>
    {children}
    {hint && (
      <span className="mt-1 block text-[11px] text-zinc-600">
        {hint}
      </span>
    )}
  </label>
)

const Toggle = ({ label, checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-[13px] text-zinc-50 transition-colors duration-150"
  >
    <span>{label}</span>
    <span
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-blue-500' : 'bg-zinc-800'
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
          checked ? 'translate-x-4.5' : 'translate-x-0.5'
        }`}
      />
    </span>
  </button>
)

const RangeField = ({ label, min, max, step = 1, value, onChange }) => (
  <label className="block">
    <span className={`mb-1.5 block ${labelClass}`}>{label}</span>
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-blue-500"
      />
      <span className="min-w-7 text-right text-xs font-mono text-zinc-400">
        {value}
      </span>
    </div>
  </label>
)

const ColorField = ({ label, value, onChange }) => (
  <label className="block">
    <span className={`mb-1.5 block ${labelClass}`}>{label}</span>
    <div
      className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5"
    >
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 cursor-pointer rounded border border-zinc-800 bg-transparent p-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-xs font-mono text-zinc-50 outline-none"
      />
    </div>
  </label>
)

/* ── Section Card ──────────────────────────────────── */
const SortableSectionCard = ({ section, children }) => {
  const [isOpen, setIsOpen] = useState(true)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    animateLayoutChanges: defaultAnimateLayoutChanges,
    transition: { duration: 200, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
  })

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={dndStyle}
      className={`rounded-xl border bg-zinc-900 p-4 transition-all duration-150 hover:border-zinc-700 ${
        isDragging
          ? 'z-50 border-blue-500 opacity-40 shadow-[0_0_24px_rgba(59,130,246,0.08)]'
          : 'border-zinc-800'
      }`}
    >
      {/* Card Header */}
      <div
        className="flex cursor-pointer select-none items-center justify-between gap-3"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen((prev) => !prev)
          }
        }}
      >
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            {...listeners}
            {...attributes}
            onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
            className={`flex h-7 w-7 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 text-zinc-500 transition-all duration-150 ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            aria-label="Drag to reorder"
          >
            <GripVertical size={14} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[13px] font-semibold text-zinc-50"
              >
                {SECTION_LABELS[section.type]}
              </span>
              <span className={getSectionPillClass(section.type)}>
                {section.type}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-zinc-600">
              {SECTION_DESCRIPTIONS[section.type]}
            </p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-zinc-500"
        >
          <ChevronDown size={16} />
        </motion.div>
      </div>

      {/* Card Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Drag Ghost ────────────────────────────────────── */
const DragPreview = ({ section }) => (
  <div
    className="rotate-2 rounded-lg border border-blue-500 bg-zinc-900 px-3.5 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.6)] opacity-[0.92]"
  >
    <div className="flex items-center gap-2">
      <GripVertical size={14} className="text-zinc-500" />
      <span className="text-[13px] font-semibold text-zinc-50">
        {SECTION_LABELS[section.type]}
      </span>
      <span className={getSectionPillClass(section.type)}>
        {section.type}
      </span>
    </div>
  </div>
)

/* ── Empty State ───────────────────────────────────── */
const EmptyState = ({ onQuickStart }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900 px-6 py-12 text-center"
  >
    <div
      className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/15"
    >
      <FileText size={24} className="text-blue-500" />
    </div>
    <h3 className="mb-1.5 text-base font-semibold text-zinc-50">
      Your README is empty
    </h3>
    <p className="mb-5 max-w-70 text-[13px] text-zinc-500">
      Add sections from the panel above, or load a full template with one click.
    </p>
    <button
      type="button"
      onClick={onQuickStart}
      className="flex items-center gap-1.5 rounded-lg border border-blue-500 bg-blue-500 px-4 py-2 text-[13px] font-semibold text-white transition-all duration-150 hover:border-blue-400 hover:bg-blue-400"
    >
      <Sparkles size={14} />
      Quick Start
    </button>
  </motion.div>
)

/* ── Section Editors ───────────────────────────────── */
const HeaderEditor = ({ section }) => {
  const updateSection = useSectionStore((s) => s.updateSection)
  const c = section.content ?? {}
  return (
    <div className="grid gap-3">
      <Field label="Name">
        <input
          className={inputClass}
          value={c.name ?? ''}
          onChange={(e) => updateSection(section.id, { name: e.target.value })}
          placeholder="Jane Developer"
        />
      </Field>
      <Field label="Tagline">
        <input
          className={inputClass}
          value={c.tagline ?? ''}
          onChange={(e) => updateSection(section.id, { tagline: e.target.value })}
          placeholder="Designing developer experiences that ship"
        />
      </Field>
      <Field label="Location">
        <input
          className={inputClass}
          value={c.location ?? ''}
          onChange={(e) => updateSection(section.id, { location: e.target.value })}
          placeholder="San Francisco, CA"
        />
      </Field>
      <Field label="Website">
        <input
          className={inputClass}
          value={c.website ?? ''}
          onChange={(e) => updateSection(section.id, { website: e.target.value })}
          placeholder="https://janedeveloper.dev"
        />
      </Field>
    </div>
  )
}

const StatsEditor = ({ section }) => {
  const updateSection = useSectionStore((s) => s.updateSection)
  const c = section.content ?? {}
  const statsUrl = buildStatsUrl(c)
  return (
    <div className="grid gap-4">
      <Field label="GitHub Username">
        <input
          className={inputClass}
          value={c.username ?? ''}
          onChange={(e) => updateSection(section.id, { username: e.target.value })}
          placeholder="octocat"
        />
      </Field>
      <Field label="Theme">
        <select
          className={inputClass}
          value={c.theme ?? 'transparent'}
          onChange={(e) => updateSection(section.id, { theme: e.target.value })}
        >
          {['transparent', 'dark', 'tokyonight', 'radical', 'onedark', 'cobalt', 'nightowl', 'dracula'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="Rank Icon">
        <select
          className={inputClass}
          value={c.rankIcon ?? 'github'}
          onChange={(e) => updateSection(section.id, { rankIcon: e.target.value })}
        >
          {['github', 'percent', 'none'].map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Toggle label="Show Icons" checked={Boolean(c.showIcons)} onChange={(v) => updateSection(section.id, { showIcons: v })} />
        <Toggle label="Hide Border" checked={Boolean(c.hideBorder)} onChange={(v) => updateSection(section.id, { hideBorder: v })} />
        <Toggle label="All Commits" checked={Boolean(c.includeAllCommits)} onChange={(v) => updateSection(section.id, { includeAllCommits: v })} />
        <Toggle label="Count Private" checked={Boolean(c.countPrivate)} onChange={(v) => updateSection(section.id, { countPrivate: v })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ColorField label="Title Color" value={c.titleColor ?? '#58a6ff'} onChange={(v) => updateSection(section.id, { titleColor: v })} />
        <ColorField label="Text Color" value={c.textColor ?? '#c9d1d9'} onChange={(v) => updateSection(section.id, { textColor: v })} />
        <ColorField label="Icon Color" value={c.iconColor ?? '#58a6ff'} onChange={(v) => updateSection(section.id, { iconColor: v })} />
        <ColorField label="BG Color" value={c.bgColor ?? '#0d1117'} onChange={(v) => updateSection(section.id, { bgColor: v })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <RangeField label="Border Radius" min={0} max={24} value={c.borderRadius ?? 8} onChange={(v) => updateSection(section.id, { borderRadius: v })} />
        <RangeField label="Card Width" min={300} max={600} value={c.cardWidth ?? 420} onChange={(v) => updateSection(section.id, { cardWidth: v })} />
        <RangeField label="Line Height" min={18} max={40} value={c.lineHeight ?? 28} onChange={(v) => updateSection(section.id, { lineHeight: v })} />
      </div>
      <Field label="Preview URL" hint="Generated from the controls above.">
        <input className={`${inputClass} text-zinc-500`} value={statsUrl} readOnly />
      </Field>
    </div>
  )
}

const SkillsEditor = ({ section }) => {
  const updateSection = useSectionStore((s) => s.updateSection)
  const c = section.content ?? {}
  const selected = new Set(c.items ?? [])
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [page, setPage] = useState(1)

  const categories = useMemo(() => {
    const set = new Set(
      TECH_OPTIONS.map((icon) => icon.category).filter(Boolean),
    )
    return ['All', ...Array.from(set).sort()]
  }, [])

  const filteredOptions = useMemo(() => {
    const term = query.trim().toLowerCase()
    return TECH_OPTIONS.filter((icon) => {
      const matchesQuery = term
        ? `${icon.title} ${icon.slug} ${icon.category}`.toLowerCase().includes(term)
        : true
      const matchesCategory = activeCategory === 'All' || icon.category === activeCategory
      return matchesQuery && matchesCategory
    })
  }, [query, activeCategory])

  const PAGE_SIZE = 24
  const totalPages = Math.max(1, Math.ceil(filteredOptions.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const visibleOptions = filteredOptions.slice(startIndex, startIndex + PAGE_SIZE)

  const toggleSkill = (slug) => {
    const next = new Set(selected)
    if (next.has(slug)) next.delete(slug)
    else next.add(slug)
    updateSection(section.id, { items: Array.from(next) })
  }

  return (
    <div className="grid gap-4">
      <RangeField label="Icon Size" min={18} max={40} value={c.iconSize ?? 32} onChange={(v) => updateSection(section.id, { iconSize: v })} />
      <Field label="Search Tech">
        <input
          className={inputClass}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
          placeholder="Search by name, slug, or category"
        />
      </Field>
      <div className="flex flex-wrap gap-1.5">
        {categories.map((category) => {
          const isActive = activeCategory === category
          return (
            <button
              key={category}
              type="button"
              onClick={() => {
                setActiveCategory(category)
                setPage(1)
              }}
              className={`cursor-pointer rounded-full border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all duration-150 select-none ${
                isActive
                  ? 'border-blue-500 bg-blue-500/15 text-zinc-50'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400'
              }`}
            >
              {category}
            </button>
          )
        })}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {visibleOptions.map((icon) => {
          const isActive = selected.has(icon.slug)
          return (
            <button
              key={icon.slug}
              type="button"
              onClick={() => toggleSkill(icon.slug)}
              className={`flex cursor-pointer flex-col gap-1.5 rounded-lg border p-2.5 text-center text-[11px] transition-all duration-150 select-none ${
                isActive
                  ? 'border-blue-500 bg-blue-500/15 text-zinc-50'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400'
              }`}
              title={`${icon.title} · ${icon.category}`}
            >
              <img
                src={`https://cdn.simpleicons.org/${icon.slug}`}
                alt={icon.title}
                className="h-6.5 w-6.5 self-center"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_ICON
                }}
              />
              <span>{icon.title}</span>
            </button>
          )
        })}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-zinc-600">
          Showing {visibleOptions.length} of {filteredOptions.length}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            className="rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[11px] text-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer select-none"
          >
            Prev
          </button>
          <span className="text-[11px] text-zinc-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
            className="rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[11px] text-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer select-none"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

const SocialsEditor = ({ section }) => {
  const updateSection = useSectionStore((s) => s.updateSection)
  const c = section.content ?? {}
  const links = c.links ?? []

  const updateLink = (index, field, value) => {
    const next = links.map((link, idx) => (idx === index ? { ...link, [field]: value } : link))
    updateSection(section.id, { links: next })
  }
  const removeLink = (index) => {
    updateSection(section.id, { links: links.filter((_, idx) => idx !== index) })
  }
  const addLink = () => {
    updateSection(section.id, { links: [...links, { label: '', url: '' }] })
  }

  return (
    <div className="grid gap-2.5">
      {links.map((link, index) => (
        <div
          key={`${link.label}-${index}`}
          className="grid gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3"
        >
          <div className="flex items-center justify-between">
            <span className={labelClass}>Link {index + 1}</span>
            <button
              type="button"
              onClick={() => removeLink(index)}
              className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 text-zinc-500 transition-all duration-150 hover:border-red-500 hover:text-red-500 cursor-pointer"
            >
              <Trash2 size={12} />
            </button>
          </div>
          <input
            className={inputClass}
            value={link.label ?? ''}
            onChange={(e) => updateLink(index, 'label', e.target.value)}
            placeholder="Label"
          />
          <input
            className={inputClass}
            value={link.url ?? ''}
            onChange={(e) => updateLink(index, 'url', e.target.value)}
            placeholder="https://example.com"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addLink}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-800 p-2 text-xs font-semibold text-zinc-500 transition-all duration-150 hover:border-zinc-700 hover:text-zinc-400 cursor-pointer select-none"
      >
        <Plus size={14} />
        Add Link
      </button>
    </div>
  )
}

const AboutEditor = ({ section }) => {
  const updateSection = useSectionStore((s) => s.updateSection)
  const c = section.content ?? {}
  return (
    <div className="grid gap-3">
      <Field label="Heading">
        <input
          className={inputClass}
          value={c.heading ?? ''}
          onChange={(e) => updateSection(section.id, { heading: e.target.value })}
          placeholder="About"
        />
      </Field>
      <Field label="Body">
        <textarea
          className={`${inputClass} min-h-25 resize-y`}
          value={c.text ?? ''}
          onChange={(e) => updateSection(section.id, { text: e.target.value })}
          placeholder="Tell the world what you are building."
        />
      </Field>
    </div>
  )
}

const SectionEditor = ({ section }) => {
  switch (section.type) {
    case 'header': return <HeaderEditor section={section} />
    case 'stats': return <StatsEditor section={section} />
    case 'skills': return <SkillsEditor section={section} />
    case 'socials': return <SocialsEditor section={section} />
    case 'about': return <AboutEditor section={section} />
    default: return null
  }
}

/* ── Preview ───────────────────────────────────────── */
const Preview = ({ markdown, previewTheme }) => {
  const isDark = previewTheme === 'dark'
  const theme = {
    container: isDark
      ? 'border-[#30363d] bg-[#0d1117] text-[#e6edf3]'
      : 'border-[#d0d7de] bg-white text-[#1f2328]',
    muted: isDark ? 'text-[#7d8590]' : 'text-[#656d76]',
    link: isDark ? 'text-[#58a6ff]' : 'text-[#0969da]',
    codeBg: isDark ? 'bg-[#161b22]' : 'bg-[#f6f8fa]',
    blockquote: isDark ? 'border-[#30363d] text-[#7d8590]' : 'border-[#d0d7de] text-[#656d76]',
  }

  const components = {
    h1: (props) => (
      <h1
        className={`mb-4 border-b pb-[0.3em] text-[32px] font-semibold ${isDark ? 'border-[#30363d]' : 'border-[#d0d7de]'}`}
        {...props}
      />
    ),
    h2: (props) => (
      <h2
        className={`mb-4 mt-6 border-b pb-[0.3em] text-[24px] font-semibold ${isDark ? 'border-[#30363d]' : 'border-[#d0d7de]'}`}
        {...props}
      />
    ),
    h3: (props) => (
      <h3 className="mb-4 mt-6 text-[20px] font-semibold" {...props} />
    ),
    p: (props) => {
      const children = React.Children.toArray(props.children)
      const isOnlyImages = children.length > 0 && children.every((child) => {
        if (typeof child === 'string') return child.trim() === ''
        if (!React.isValidElement(child)) return false
        const src = child.props?.src
        return (
          typeof src === 'string'
          && (src.includes('cdn.simpleicons.org') || src.includes('github-readme-stats.vercel.app'))
        )
      })
      return (
        <p className={`mb-4 leading-normal ${isOnlyImages ? 'select-none' : ''}`} {...props} />
      )
    },
    ul: (props) => (
      <ul className="m-0 p-0" {...props} />
    ),
    ol: (props) => (
      <ol className="m-0 p-0" {...props} />
    ),
    a: (props) => (
      <a className={`${theme.link} hover:underline`} {...props} />
    ),
    li: (props) => (
      <li className="mb-1 ml-6 list-disc" {...props} />
    ),
    code: ({ inline, ...props }) => (
      inline ? (
        <code className={`rounded-md ${theme.codeBg} px-[0.4em] py-[0.2em] text-[85%] font-mono`} {...props} />
      ) : (
        <code className="bg-transparent p-0 text-[100%] font-mono" {...props} />
      )
    ),
    pre: (props) => (
      <pre className={`mb-4 overflow-auto rounded-md ${theme.codeBg} p-4 text-[85%] leading-[1.45]`} {...props} />
    ),
    blockquote: (props) => (
      <blockquote className={`my-0 border-l-4 px-4 ${theme.blockquote}`} {...props} />
    ),
    img: ({ src = '', alt = '', ...props }) => {
      const isTechIcon = typeof src === 'string' && src.includes('cdn.simpleicons.org')
      const isGitStats = typeof src === 'string' && src.includes('github-readme-stats.vercel.app')
      const selectNone = (isTechIcon || isGitStats) ? 'select-none' : ''
      const className = isTechIcon
        ? 'inline-block align-middle mr-2.5 mb-2 h-auto w-[clamp(24px,5vw,40px)] max-w-none'
        : 'max-w-full h-auto'
      return <img src={src} alt={alt} className={`${className} ${selectNone}`} {...props} />
    },
  }

  return (
    <div
      className={`w-full max-w-220 rounded-xl border ${theme.container} shadow-[0_4px_12px_rgba(0,0,0,0.5)]`}
    >
      <div className="px-10 py-8">
        <div className="wrap-break-word text-base leading-normal font-['-apple-system', BlinkMacSystemFont,'Segoe_UI','Noto_Sans',Helvetica,Arial,sans-serif]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={components}
          >
            {markdown}
          </ReactMarkdown>
          {!markdown && (
            <p className={`text-sm ${theme.muted}`}>
              Start adding sections to see the preview.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── GitHub Mode Toggle ────────────────────────────── */
const GithubModeToggle = () => {
  const previewTheme = useSectionStore((s) => s.previewTheme)
  const setPreviewTheme = useSectionStore((s) => s.setPreviewTheme)

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border border-zinc-800 bg-zinc-950 p-0.75 select-none"
    >
      <button
        type="button"
        onClick={() => setPreviewTheme('dark')}
        className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all duration-150 cursor-pointer ${
          previewTheme === 'dark'
            ? 'border-zinc-800 bg-zinc-900 text-zinc-50'
            : 'border-transparent text-zinc-500'
        }`}
      >
        <Moon size={12} />
        Dark
      </button>
      <button
        type="button"
        onClick={() => setPreviewTheme('light')}
        className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all duration-150 cursor-pointer ${
          previewTheme === 'light'
            ? 'border-zinc-800 bg-zinc-900 text-zinc-50'
            : 'border-transparent text-zinc-500'
        }`}
      >
        <Sun size={12} />
        Light
      </button>
    </div>
  )
}

/* ── Main Component ────────────────────────────────── */
const ReadmeBuilder = ({ activePanel, onOpenProjectModal }) => {
  const sections = useSectionStore((s) => s.sections)
  const previewTheme = useSectionStore((s) => s.previewTheme)
  const addSection = useSectionStore((s) => s.addSection)
  const removeSection = useSectionStore((s) => s.removeSection)
  const moveSection = useSectionStore((s) => s.moveSection)
  const resetToDefaults = useSectionStore((s) => s.resetToDefaults)

  const markdown = useMemo(() => generateMarkdown(sections), [sections])
  const [activeId, setActiveId] = useState(null)
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

  const handleDragStart = (e) => setActiveId(e.active.id)
  const handleDragEnd = (e) => {
    if (e.over && e.active.id !== e.over.id) moveSection(e.active.id, e.over.id)
    setActiveId(null)
  }
  const handleDragCancel = () => setActiveId(null)

  const handleCopyMarkdown = async () => {
    if (!navigator.clipboard?.writeText) {
      toast.error('Clipboard not available.')
      return
    }
    try {
      await navigator.clipboard.writeText(markdown)
      toast.success('Markdown copied to clipboard!')
    } catch {
      toast.error('Copy failed. Try again.')
    }
  }

  const handleResetDefaults = () => {
    resetToDefaults()
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
        className="grid min-h-0 flex-1 grid-cols-[400px_1fr]"
      >
        {/* ── Builder Column ─────────────────── */}
        <div
          className="sticky top-12.25 h-[calc(100vh-49px)] overflow-y-auto border-r border-zinc-800 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700"
        >
          <div className="p-5">
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
                          <SortableSectionCard key={section.id} section={section}>
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
                            <SectionEditor section={section} />
                          </SortableSectionCard>
                        ))}
                      </AnimatePresence>
                    </SortableContext>
                    <DragOverlay dropAnimation={null}>
                      {activeSection ? <DragPreview section={activeSection} /> : null}
                    </DragOverlay>
                  </DndContext>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Preview Column ─────────────────── */}
        <div
          className="sticky top-12.25 h-[calc(100vh-49px)] overflow-y-auto bg-zinc-950 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700"
        >
          <div className="p-5">
            {/* Preview Header */}
            <div
              className="mb-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-green-500 animate-pulse" />
                <span className={labelClass}>Preview</span>
                <span className="text-[11px] text-zinc-600">· Live</span>
              </div>
              <GithubModeToggle />
            </div>

            {/* Preview Pane */}
            <Preview markdown={markdown} previewTheme={previewTheme} />
          </div>
        </div>
      </div>

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          className: '!rounded-lg !border !border-zinc-800 !bg-zinc-900 !text-[13px] !text-zinc-50 !font-sans select-none',
        }}
      />
    </div>
  )
}

export default ReadmeBuilder

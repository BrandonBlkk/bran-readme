import React, { useMemo, useState } from 'react'
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
const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  fontSize: '13px',
  fontFamily: 'var(--font-mono)',
  color: 'var(--text-primary)',
  background: 'var(--bg-base)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  outline: 'none',
  transition: 'border-color 150ms ease, box-shadow 150ms ease',
}

const inputFocusProps = {
  onFocus: (e) => {
    e.currentTarget.style.borderColor = 'var(--accent)'
    e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-muted)'
  },
  onBlur: (e) => {
    e.currentTarget.style.borderColor = 'var(--border-default)'
    e.currentTarget.style.boxShadow = 'none'
  },
}

const labelStyle = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-sans)',
}

/* ── Form Components ───────────────────────────────── */
const Field = ({ label, hint, children }) => (
  <label style={{ display: 'block' }}>
    <span style={{ ...labelStyle, display: 'block', marginBottom: '6px' }}>{label}</span>
    {children}
    {hint && (
      <span style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: 'var(--text-faint)' }}>
        {hint}
      </span>
    )}
  </label>
)

const Toggle = ({ label, checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      padding: '8px 12px',
      fontSize: '13px',
      fontFamily: 'var(--font-sans)',
      color: 'var(--text-primary)',
      background: 'var(--bg-base)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      transition: 'border-color 150ms ease',
    }}
  >
    <span>{label}</span>
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        width: '36px',
        height: '20px',
        borderRadius: '10px',
        background: checked ? 'var(--accent)' : 'var(--border-default)',
        transition: 'background 200ms ease',
      }}
    >
      <span
        style={{
          display: 'block',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: '#fff',
          transform: checked ? 'translateX(18px)' : 'translateX(2px)',
          transition: 'transform 200ms ease',
        }}
      />
    </span>
  </button>
)

const RangeField = ({ label, min, max, step = 1, value, onChange }) => (
  <label style={{ display: 'block' }}>
    <span style={{ ...labelStyle, display: 'block', marginBottom: '6px' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: 'var(--accent)' }}
      />
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', minWidth: '28px', textAlign: 'right' }}>
        {value}
      </span>
    </div>
  </label>
)

const ColorField = ({ label, value, onChange }) => (
  <label style={{ display: 'block' }}>
    <span style={{ ...labelStyle, display: 'block', marginBottom: '6px' }}>{label}</span>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        background: 'var(--bg-base)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '28px',
          height: '28px',
          padding: 0,
          border: '1px solid var(--border-default)',
          borderRadius: '4px',
          background: 'transparent',
          cursor: 'pointer',
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-primary)',
        }}
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
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...dndStyle,
        padding: '16px',
        background: 'var(--bg-surface)',
        border: `1px solid ${isDragging ? 'var(--accent)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: isDragging ? '0 0 24px var(--accent-glow)' : 'none',
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      {/* Card Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            {...listeners}
            {...attributes}
            onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-base)',
              color: 'var(--text-muted)',
              cursor: 'grab',
              transition: 'all 150ms ease',
            }}
            aria-label="Drag to reorder"
          >
            <GripVertical size={14} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {SECTION_LABELS[section.type]}
              </span>
              <span className="section-pill" data-type={section.type}>
                {section.type}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '2px' }}>
              {SECTION_DESCRIPTIONS[section.type]}
            </p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: 'var(--text-muted)' }}
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
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: '16px' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Drag Ghost ────────────────────────────────────── */
const DragPreview = ({ section }) => (
  <div
    className="drag-ghost"
    style={{
      padding: '10px 14px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--accent)',
      borderRadius: 'var(--radius-md)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <GripVertical size={14} style={{ color: 'var(--text-muted)' }} />
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
        {SECTION_LABELS[section.type]}
      </span>
      <span className="section-pill" data-type={section.type}>
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
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--border-default)',
      background: 'var(--bg-surface)',
    }}
  >
    <div
      style={{
        width: '56px',
        height: '56px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--accent-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        border: '1px solid rgba(59,130,246,0.15)',
      }}
    >
      <FileText size={24} style={{ color: 'var(--accent)' }} />
    </div>
    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
      Your README is empty
    </h3>
    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '280px' }}>
      Add sections from the panel above, or load a full template with one click.
    </p>
    <button
      type="button"
      onClick={onQuickStart}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        color: '#fff',
        background: 'var(--accent)',
        border: '1px solid var(--accent)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all 150ms ease',
      }}
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
    <div style={{ display: 'grid', gap: '12px' }}>
      <Field label="Name">
        <input style={inputStyle} value={c.name ?? ''} onChange={(e) => updateSection(section.id, { name: e.target.value })} placeholder="Jane Developer" {...inputFocusProps} />
      </Field>
      <Field label="Tagline">
        <input style={inputStyle} value={c.tagline ?? ''} onChange={(e) => updateSection(section.id, { tagline: e.target.value })} placeholder="Designing developer experiences that ship" {...inputFocusProps} />
      </Field>
      <Field label="Location">
        <input style={inputStyle} value={c.location ?? ''} onChange={(e) => updateSection(section.id, { location: e.target.value })} placeholder="San Francisco, CA" {...inputFocusProps} />
      </Field>
      <Field label="Website">
        <input style={inputStyle} value={c.website ?? ''} onChange={(e) => updateSection(section.id, { website: e.target.value })} placeholder="https://janedeveloper.dev" {...inputFocusProps} />
      </Field>
    </div>
  )
}

const StatsEditor = ({ section }) => {
  const updateSection = useSectionStore((s) => s.updateSection)
  const c = section.content ?? {}
  const statsUrl = buildStatsUrl(c)
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <Field label="GitHub Username">
        <input style={inputStyle} value={c.username ?? ''} onChange={(e) => updateSection(section.id, { username: e.target.value })} placeholder="octocat" {...inputFocusProps} />
      </Field>
      <Field label="Theme">
        <select style={inputStyle} value={c.theme ?? 'transparent'} onChange={(e) => updateSection(section.id, { theme: e.target.value })}>
          {['transparent', 'dark', 'tokyonight', 'radical', 'onedark', 'cobalt', 'nightowl', 'dracula'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="Rank Icon">
        <select style={inputStyle} value={c.rankIcon ?? 'github'} onChange={(e) => updateSection(section.id, { rankIcon: e.target.value })}>
          {['github', 'percent', 'none'].map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        <Toggle label="Show Icons" checked={Boolean(c.showIcons)} onChange={(v) => updateSection(section.id, { showIcons: v })} />
        <Toggle label="Hide Border" checked={Boolean(c.hideBorder)} onChange={(v) => updateSection(section.id, { hideBorder: v })} />
        <Toggle label="All Commits" checked={Boolean(c.includeAllCommits)} onChange={(v) => updateSection(section.id, { includeAllCommits: v })} />
        <Toggle label="Count Private" checked={Boolean(c.countPrivate)} onChange={(v) => updateSection(section.id, { countPrivate: v })} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <ColorField label="Title Color" value={c.titleColor ?? '#58a6ff'} onChange={(v) => updateSection(section.id, { titleColor: v })} />
        <ColorField label="Text Color" value={c.textColor ?? '#c9d1d9'} onChange={(v) => updateSection(section.id, { textColor: v })} />
        <ColorField label="Icon Color" value={c.iconColor ?? '#58a6ff'} onChange={(v) => updateSection(section.id, { iconColor: v })} />
        <ColorField label="BG Color" value={c.bgColor ?? '#0d1117'} onChange={(v) => updateSection(section.id, { bgColor: v })} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <RangeField label="Border Radius" min={0} max={24} value={c.borderRadius ?? 8} onChange={(v) => updateSection(section.id, { borderRadius: v })} />
        <RangeField label="Card Width" min={300} max={600} value={c.cardWidth ?? 420} onChange={(v) => updateSection(section.id, { cardWidth: v })} />
        <RangeField label="Line Height" min={18} max={40} value={c.lineHeight ?? 28} onChange={(v) => updateSection(section.id, { lineHeight: v })} />
      </div>
      <Field label="Preview URL" hint="Generated from the controls above.">
        <input style={{ ...inputStyle, color: 'var(--text-muted)' }} value={statsUrl} readOnly />
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
    <div style={{ display: 'grid', gap: '16px' }}>
      <RangeField label="Icon Size" min={18} max={40} value={c.iconSize ?? 32} onChange={(v) => updateSection(section.id, { iconSize: v })} />
      <Field label="Search Tech">
        <input
          style={inputStyle}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
          placeholder="Search by name, slug, or category"
          {...inputFocusProps}
        />
      </Field>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
              style={{
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                borderRadius: '9999px',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-default)'}`,
                background: isActive ? 'var(--accent-muted)' : 'var(--bg-base)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {category}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
        {visibleOptions.map((icon) => {
          const isActive = selected.has(icon.slug)
          return (
            <button
              key={icon.slug}
              type="button"
              onClick={() => toggleSkill(icon.slug)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '10px',
                fontSize: '11px',
                fontFamily: 'var(--font-sans)',
                textAlign: 'center',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-default)'}`,
                background: isActive ? 'var(--accent-muted)' : 'var(--bg-base)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              title={`${icon.title} · ${icon.category}`}
            >
              <img
                src={`https://cdn.simpleicons.org/${icon.slug}`}
                alt={icon.title}
                style={{ width: '26px', height: '26px', alignSelf: 'center' }}
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
          Showing {visibleOptions.length} of {filteredOptions.length}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              borderRadius: '9999px',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-base)',
              color: 'var(--text-secondary)',
              opacity: currentPage <= 1 ? 0.5 : 1,
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Prev
          </button>
          <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              borderRadius: '9999px',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-base)',
              color: 'var(--text-secondary)',
              opacity: currentPage >= totalPages ? 0.5 : 1,
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            }}
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
    <div style={{ display: 'grid', gap: '10px' }}>
      {links.map((link, index) => (
        <div
          key={`${link.label}-${index}`}
          style={{
            display: 'grid',
            gap: '8px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-base)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={labelStyle}>Link {index + 1}</span>
            <button
              type="button"
              onClick={() => removeLink(index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--danger)'
                e.currentTarget.style.color = 'var(--danger)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)'
                e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              <Trash2 size={12} />
            </button>
          </div>
          <input style={inputStyle} value={link.label ?? ''} onChange={(e) => updateLink(index, 'label', e.target.value)} placeholder="Label" {...inputFocusProps} />
          <input style={inputStyle} value={link.url ?? ''} onChange={(e) => updateLink(index, 'url', e.target.value)} placeholder="https://example.com" {...inputFocusProps} />
        </div>
      ))}
      <button
        type="button"
        onClick={addLink}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '8px',
          fontSize: '12px',
          fontWeight: 600,
          fontFamily: 'var(--font-sans)',
          color: 'var(--text-muted)',
          background: 'transparent',
          border: '1px dashed var(--border-default)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          transition: 'all 150ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-muted)'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-default)'
          e.currentTarget.style.color = 'var(--text-muted)'
        }}
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
    <div style={{ display: 'grid', gap: '12px' }}>
      <Field label="Heading">
        <input style={inputStyle} value={c.heading ?? ''} onChange={(e) => updateSection(section.id, { heading: e.target.value })} placeholder="About" {...inputFocusProps} />
      </Field>
      <Field label="Body">
        <textarea
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
          value={c.text ?? ''}
          onChange={(e) => updateSection(section.id, { text: e.target.value })}
          placeholder="Tell the world what you are building."
          {...inputFocusProps}
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
  const themeClass = previewTheme === 'dark' ? 'github-preview-dark' : 'github-preview-light'

  return (
    <div
      className={themeClass}
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        maxWidth: '880px',
        width: '100%',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div style={{ padding: '32px 40px' }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {markdown}
        </ReactMarkdown>
        {!markdown && (
          <p style={{ fontSize: '14px', color: 'var(--gh-muted, var(--text-muted))' }}>
            Start adding sections to see the preview.
          </p>
        )}
      </div>
    </div>
  )
}

/* ── GitHub Mode Toggle ────────────────────────────── */
const GithubModeToggle = () => {
  const previewTheme = useSectionStore((s) => s.previewTheme)
  const setPreviewTheme = useSectionStore((s) => s.setPreviewTheme)

  const btnBase = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 500,
    fontFamily: 'var(--font-sans)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        padding: '3px',
        background: 'var(--bg-base)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
      }}
    >
      <button
        type="button"
        onClick={() => setPreviewTheme('dark')}
        style={{
          ...btnBase,
          background: previewTheme === 'dark' ? 'var(--bg-surface)' : 'transparent',
          color: previewTheme === 'dark' ? 'var(--text-primary)' : 'var(--text-muted)',
          border: previewTheme === 'dark' ? '1px solid var(--border-default)' : '1px solid transparent',
        }}
      >
        <Moon size={12} />
        Dark
      </button>
      <button
        type="button"
        onClick={() => setPreviewTheme('light')}
        style={{
          ...btnBase,
          background: previewTheme === 'light' ? 'var(--bg-surface)' : 'transparent',
          color: previewTheme === 'light' ? 'var(--text-primary)' : 'var(--text-muted)',
          border: previewTheme === 'light' ? '1px solid var(--border-default)' : '1px solid transparent',
        }}
      >
        <Sun size={12} />
        Light
      </button>
    </div>
  )
}

/* ── Main Component ────────────────────────────────── */
const ReadmeBuilder = ({ activePanel }) => {
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
    toast.success('Defaults restored.')
  }

  const handleQuickStart = () => {
    resetToDefaults()
    toast.success('Template loaded!')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Navbar onReset={handleResetDefaults} onCopy={handleCopyMarkdown} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '400px 1fr',
          gap: '0px',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* ── Builder Column ─────────────────── */}
        <div
          style={{
            borderRight: '1px solid var(--border-default)',
            overflowY: 'auto',
            height: 'calc(100vh - 49px)',
            position: 'sticky',
            top: '49px',
          }}
        >
          <div style={{ padding: '20px' }}>
            {/* Add Section Panel */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <p style={labelStyle}>Add Section</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Choose a template to insert.
                </p>
              </div>
              <div style={{ display: 'grid', gap: '6px' }}>
                {SECTION_LIBRARY.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      addSection(item.type)
                      toast.success(`${item.label} section added.`)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      textAlign: 'left',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-surface)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-muted)'
                      e.currentTarget.style.background = 'var(--bg-elevated)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-default)'
                      e.currentTarget.style.background = 'var(--bg-surface)'
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '1px' }}>
                        {item.description}
                      </p>
                    </div>
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        border: '1px solid var(--border-default)',
                        background: 'var(--bg-base)',
                        color: 'var(--text-muted)',
                        flexShrink: 0,
                      }}
                    >
                      <Plus size={14} />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                height: '1px',
                background: 'var(--border-default)',
                marginBottom: '20px',
              }}
            />

            {/* Active Sections */}
            <div>
              <div style={{ marginBottom: '12px' }}>
                <p style={labelStyle}>Active Sections</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Drag to reorder · Expand to edit.
                </p>
              </div>

              {sections.length === 0 ? (
                <EmptyState onQuickStart={handleQuickStart} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                              <button
                                type="button"
                                onClick={() => removeSection(section.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  fontFamily: 'var(--font-sans)',
                                  color: 'var(--danger)',
                                  background: 'var(--danger-muted)',
                                  border: '1px solid rgba(239,68,68,0.2)',
                                  borderRadius: 'var(--radius-sm)',
                                  cursor: 'pointer',
                                  transition: 'all 150ms ease',
                                }}
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
          style={{
            overflowY: 'auto',
            height: 'calc(100vh - 49px)',
            position: 'sticky',
            top: '49px',
            background: 'var(--bg-base)',
          }}
        >
          <div style={{ padding: '20px' }}>
            {/* Preview Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="live-dot" />
                <span style={{ ...labelStyle }}>Preview</span>
                <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>· Live</span>
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
          style: {
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            borderRadius: 'var(--radius-md)',
          },
        }}
      />
    </div>
  )
}

export default ReadmeBuilder

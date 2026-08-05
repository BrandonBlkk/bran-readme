import React, { useMemo, useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowDown, ArrowUp, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import Toggle from '../Toggle'
import { Field, RangeField, ColorField, inputClass, labelClass } from './FormFields'
import { buildActivityUrl, buildStreakUrl } from '../../utils/markdown'
import { GIT_STATS_CARD_DEFINITIONS, normalizeGitStatsOrder } from '../../utils/gitStats'

const GIT_STATS_THEMES = ['transparent', 'dark', 'tokyonight', 'radical', 'onedark', 'cobalt', 'nightowl', 'dracula']
const STREAK_THEMES = ['dark', 'radical', 'tokyonight', 'onedark', 'cobalt', 'highcontrast', 'dracula', 'monokai', 'vue', 'vue-dark', 'shades-of-purple', 'nightowl', 'buefy', 'blue-green', 'algolia', 'great-gatsby', 'darcula', 'bear', 'gruvbox_duo', 'material-palenight', 'neon', 'ads-juicy-fresh', 'soft-green', 'default']
const ACTIVITY_THEMES = ['github-compact', 'github', 'github-dark', 'github-dark-dimmed', 'react', 'react-dark', 'rogue', 'merko', 'vue', 'tokyo-night', 'high-contrast', 'dracula', 'xcode', 'coral']

const moveListItem = (list, fromIndex, toIndex) => {
  const next = [...list]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

const isGitStatsCardEnabled = (content, toggleKey) =>
  toggleKey === 'showStreakStats' || toggleKey === 'showActivityGraph'
    ? Boolean(content[toggleKey])
    : content[toggleKey] !== false

const HeaderEditor = ({ section, updateSection }) => {
  const c = section.content ?? {}
  return (
    <div className="grid gap-3">
      <Field label="Name">
        <input
          className={inputClass}
          value={c.name ?? ''}
          onChange={(e) => updateSection(section.id, { name: e.target.value })}
          placeholder="Brandon Developer"
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
          placeholder="Yangon, Myanmar"
        />
      </Field>
      <Field label="Website">
        <input
          className={inputClass}
          value={c.website ?? ''}
          onChange={(e) => updateSection(section.id, { website: e.target.value })}
          placeholder="https://brandondevme.vercel.app"
        />
      </Field>
      <Field label="Alignment">
        <select
          className={inputClass}
          value={c.align ?? 'left'}
          onChange={(e) => updateSection(section.id, { align: e.target.value })}
        >
          {['left', 'center', 'right'].map((align) => (
            <option key={align} value={align}>{align}</option>
          ))}
        </select>
      </Field>
    </div>
  )
}

const AboutEditor = ({ section, updateSection }) => {
  const c = section.content ?? {}
  return (
    <div className="grid gap-3">
      <Field label="Body">
        <textarea
          className={`${inputClass} min-h-25 resize-y`}
          value={c.text ?? ''}
          onChange={(e) => updateSection(section.id, { text: e.target.value })}
          placeholder="Tell the world what you are building."
        />
      </Field>
      <Field label="Alignment">
        <select
          className={inputClass}
          value={c.align ?? 'left'}
          onChange={(e) => updateSection(section.id, { align: e.target.value })}
        >
          {['left', 'center', 'right'].map((align) => (
            <option key={align} value={align}>{align}</option>
          ))}
        </select>
      </Field>
    </div>
  )
}

const SortableStatCard = ({ id, card, isEnabled }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
        isDragging
          ? 'z-50 border-blue-500 bg-zinc-900 opacity-80 shadow-lg'
          : 'border-zinc-800 bg-zinc-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className={`flex h-7 w-7 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 text-zinc-500 transition-all duration-150 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          aria-label="Drag to reorder"
        >
          <GripVertical size={14} />
        </button>
        <div>
          <p className="text-[12px] font-semibold text-zinc-100">
            {card.label}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.08em] text-zinc-500">
            {isEnabled ? 'Visible' : 'Hidden'}
          </p>
        </div>
      </div>
    </div>
  )
}

const StatsEditor = ({ section, updateSection, buildStatsUrl }) => {
  const c = section.content ?? {}
  const statsUrl = buildStatsUrl(c)
  const streakUrl = buildStreakUrl(c)
  const activityUrl = buildActivityUrl(c)
  const statsOrder = normalizeGitStatsOrder(c.statsOrder)
  const updateStats = (updates) => updateSection(section.id, updates)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = statsOrder.indexOf(active.id)
      const newIndex = statsOrder.indexOf(over.id)
      updateStats({ statsOrder: arrayMove(statsOrder, oldIndex, newIndex) })
    }
  }

  return (
    <div className="grid gap-4">
      <Field label="GitHub Username">
        <input
          className={inputClass}
          value={c.username ?? ''}
          onChange={(e) => updateStats({ username: e.target.value })}
          placeholder="BrandonBlkk"
        />
      </Field>
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5">
        <div className="mb-3">
          <p className={labelClass}>Display Order</p>
          <p className="mt-1 text-[11px] text-zinc-600">
            Reorder the Git stats cards inside this one section.
          </p>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={statsOrder} strategy={verticalListSortingStrategy}>
            <div className="grid gap-2">
              {statsOrder.map((cardId, index) => {
                const card = GIT_STATS_CARD_DEFINITIONS.find((item) => item.id === cardId)
                if (!card) return null

                const isEnabled = isGitStatsCardEnabled(c, card.toggleKey)

                return (
                  <SortableStatCard
                    key={card.id}
                    id={card.id}
                    card={card}
                    isEnabled={isEnabled}
                  />
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5">
        <div className="mb-3">
          <p className={labelClass}>Stats Cards</p>
          <p className="mt-1 text-[11px] text-zinc-600">
            Main GitHub cards, top languages, and trophies.
          </p>
        </div>
        <div className="grid gap-4">
          <Field label="Theme">
            <select
              className={inputClass}
              value={c.theme ?? 'transparent'}
              onChange={(e) => updateStats({ theme: e.target.value })}
            >
              {GIT_STATS_THEMES.map((theme) => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </Field>
          <Field label="Rank Icon">
            <select
              className={inputClass}
              value={c.rankIcon ?? 'github'}
              onChange={(e) => updateStats({ rankIcon: e.target.value })}
            >
              {['github', 'percent', 'none'].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Toggle label="Show Git Stats" checked={c.showMainStats !== false} onChange={(value) => updateStats({ showMainStats: value })} />
            <Toggle label="Show Languages" checked={c.showLanguageStats !== false} onChange={(value) => updateStats({ showLanguageStats: value })} />
            <Toggle label="Show Trophies" checked={c.showTrophyStats !== false} onChange={(value) => updateStats({ showTrophyStats: value })} />
            <Toggle label="Show Icons" checked={Boolean(c.showIcons)} onChange={(value) => updateStats({ showIcons: value })} />
            <Toggle label="Hide Border" checked={Boolean(c.hideBorder)} onChange={(value) => updateStats({ hideBorder: value })} />
            <Toggle label="All Commits" checked={Boolean(c.includeAllCommits)} onChange={(value) => updateStats({ includeAllCommits: value })} />
            <Toggle label="Count Private" className='col-span-2' checked={Boolean(c.countPrivate)} onChange={(value) => updateStats({ countPrivate: value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ColorField label="Title Color" value={c.titleColor ?? '#58a6ff'} onChange={(value) => updateStats({ titleColor: value })} />
            <ColorField label="Text Color" value={c.textColor ?? '#c9d1d9'} onChange={(value) => updateStats({ textColor: value })} />
            <ColorField label="Icon Color" value={c.iconColor ?? '#58a6ff'} onChange={(value) => updateStats({ iconColor: value })} />
            <ColorField label="Background" value={c.bgColor ?? '#171f2b'} onChange={(value) => updateStats({ bgColor: value })} />
          </div>
          <RangeField label="Border Radius" min={0} max={24} value={c.borderRadius ?? 8} onChange={(value) => updateStats({ borderRadius: value })} />
          <Field label="Stats Preview URL" hint="Main GitHub stats card URL.">
            <input className={`${inputClass} text-zinc-500`} value={statsUrl} readOnly />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5">
        <div className="mb-3">
          <p className={labelClass}>Streak Card</p>
          <p className="mt-1 text-[11px] text-zinc-600">
            Configure the streak card without adding a separate section.
          </p>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <Toggle label="Show Streak" checked={Boolean(c.showStreakStats)} onChange={(value) => updateStats({ showStreakStats: value })} />
            <Toggle label="Hide Border" checked={Boolean(c.streakHideBorder)} onChange={(value) => updateStats({ streakHideBorder: value })} />
          </div>
          <Field label="Theme">
            <select
              className={inputClass}
              value={c.streakTheme ?? 'dark'}
              onChange={(e) => updateStats({ streakTheme: e.target.value })}
            >
              {STREAK_THEMES.map((theme) => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <ColorField label="Background" value={c.streakBgColor ?? '#171f2b'} onChange={(value) => updateStats({ streakBgColor: value })} />
            <ColorField label="Stroke" value={c.streakStrokeColor ?? '#58a6ff'} onChange={(value) => updateStats({ streakStrokeColor: value })} />
            <ColorField label="Ring" value={c.streakRingColor ?? '#58a6ff'} onChange={(value) => updateStats({ streakRingColor: value })} />
            <ColorField label="Fire" value={c.streakFireColor ?? '#fbbf24'} onChange={(value) => updateStats({ streakFireColor: value })} />
            <ColorField label="Current Streak" value={c.streakCurrStreakColor ?? '#58a6ff'} onChange={(value) => updateStats({ streakCurrStreakColor: value })} />
            <ColorField label="Side Numbers" value={c.streakSideNumColor ?? '#c9d1d9'} onChange={(value) => updateStats({ streakSideNumColor: value })} />
            <ColorField label="Side Labels" value={c.streakSideLabelsColor ?? '#8b949e'} onChange={(value) => updateStats({ streakSideLabelsColor: value })} />
            <ColorField label="Dates" value={c.streakDateColor ?? '#8b949e'} onChange={(value) => updateStats({ streakDateColor: value })} />
          </div>
          <RangeField label="Border Radius" min={0} max={24} value={c.streakBorderRadius ?? 8} onChange={(value) => updateStats({ streakBorderRadius: value })} />
          <Field label="Streak Preview URL" hint="Generated from the streak controls above.">
            <input className={`${inputClass} text-zinc-500`} value={streakUrl} readOnly />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5">
        <div className="mb-3">
          <p className={labelClass}>Activity Graph</p>
          <p className="mt-1 text-[11px] text-zinc-600">
            Keep the contribution graph inside the same Git stats section.
          </p>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <Toggle label="Show Activity" checked={Boolean(c.showActivityGraph)} onChange={(value) => updateStats({ showActivityGraph: value })} />
            <Toggle label="Hide Border" checked={Boolean(c.activityHideBorder)} onChange={(value) => updateStats({ activityHideBorder: value })} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Toggle label="Hide Grid" checked={Boolean(c.activityHideGrid)} onChange={(value) => updateStats({ activityHideGrid: value })} />
            <Toggle label="Show Area" checked={Boolean(c.activityShowArea)} onChange={(value) => updateStats({ activityShowArea: value })} />
          </div>
          <Field label="Theme">
            <select
              className={inputClass}
              value={c.activityTheme ?? 'github-compact'}
              onChange={(e) => updateStats({ activityTheme: e.target.value })}
            >
              {ACTIVITY_THEMES.map((theme) => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <ColorField label="Background" value={c.activityBgColor ?? '#171f2b'} onChange={(value) => updateStats({ activityBgColor: value })} />
            <ColorField label="Line Color" value={c.activityLineColor ?? '#58a6ff'} onChange={(value) => updateStats({ activityLineColor: value })} />
            <ColorField label="Point Color" value={c.activityPointColor ?? '#58a6ff'} onChange={(value) => updateStats({ activityPointColor: value })} />
            <ColorField label="Area Color" value={c.activityAreaColor ?? '#58a6ff'} onChange={(value) => updateStats({ activityAreaColor: value })} />
          </div>
          <RangeField label="Border Radius" min={0} max={24} value={c.activityRadius ?? 8} onChange={(value) => updateStats({ activityRadius: value })} />
          <Field label="Activity Preview URL" hint="Generated from the graph controls above.">
            <input className={`${inputClass} text-zinc-500`} value={activityUrl} readOnly />
          </Field>
        </div>
      </div>
    </div>
  )
}

const SkillsEditor = ({ section, updateSection, techOptions, fallbackIcon }) => {
  const c = section.content ?? {}
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [brokenIcons, setBrokenIcons] = useState([])
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

  const optionSlugBySkillSlug = {}
  techOptions.forEach((icon) => {
    optionSlugBySkillSlug[icon.slug] = icon.slug
    optionSlugBySkillSlug[toSkillIconsSlug(icon.slug)] = icon.slug
  })
  const selected = new Set(
    (c.items ?? []).map((slug) => {
      const raw = String(slug ?? '')
      return optionSlugBySkillSlug[raw] || optionSlugBySkillSlug[toSkillIconsSlug(raw)] || raw
    }),
  )

  const brokenSet = useMemo(() => new Set(brokenIcons), [brokenIcons])

  const categories = useMemo(() => {
    const set = new Set(
      techOptions.map((icon) => icon.category).filter(Boolean),
    )
    return ['All', ...Array.from(set).sort()]
  }, [techOptions])

  const filteredOptions = useMemo(() => {
    const term = query.trim().toLowerCase()
    return techOptions.filter((icon) => {
      const skillSlug = toSkillIconsSlug(icon.slug)
      if (!skillSlug || brokenSet.has(skillSlug)) return false
      const matchesQuery = term
        ? `${icon.title} ${icon.slug} ${icon.category}`.toLowerCase().includes(term)
        : true
      const matchesCategory = activeCategory === 'All' || icon.category === activeCategory
      return matchesQuery && matchesCategory
    })
  }, [query, activeCategory, techOptions, brokenSet])

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
      <div className="grid gap-4">
        <RangeField
          label="Icon Size"
          min={18}
          max={64}
          value={c.iconSize ?? 40}
          onChange={(v) => updateSection(section.id, { iconSize: v })}
        />
        <RangeField
          label="Icon Spacing"
          min={0}
          max={20}
          value={c.iconSpacing ?? 2}
          onChange={(v) => updateSection(section.id, { iconSpacing: v })}
        />
        <Field label="Alignment">
          <select
            className={inputClass}
            value={c.align ?? 'left'}
            onChange={(e) => updateSection(section.id, { align: e.target.value })}
          >
            {['left', 'center', 'right'].map((align) => (
              <option key={align} value={align}>{align}</option>
            ))}
          </select>
        </Field>
      </div>
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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                src={`https://skillicons.dev/icons?i=${toSkillIconsSlug(icon.slug)}&theme=dark`}
                alt={icon.title}
                className="h-6.5 w-6.5 self-center"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = fallbackIcon
                  const skillSlug = toSkillIconsSlug(icon.slug)
                  if (skillSlug) {
                    if (!brokenSet.has(skillSlug)) {
                      toast.error(`Icon not available: ${icon.title}`)
                    }
                    setBrokenIcons((prev) => (prev.includes(skillSlug) ? prev : [...prev, skillSlug]))
                  }
                  if ((c.items ?? []).includes(icon.slug)) {
                    updateSection(section.id, { items: (c.items ?? []).filter((item) => item !== icon.slug) })
                  }
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

const SocialsEditor = ({ section, updateSection, socialOptions, fallbackIcon }) => {
  const c = section.content ?? {}
  const links = Array.isArray(c.links) ? c.links : []
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [page, setPage] = useState(1)

  const normalizeKey = (value) =>
    String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

  const socialIndex = useMemo(() => {
    const map = {}
    socialOptions.forEach((icon) => {
      map[icon.slug] = icon
      map[icon.title.toLowerCase()] = icon
      map[icon.slug.toLowerCase()] = icon
      map[normalizeKey(icon.title)] = icon
      map[normalizeKey(icon.slug)] = icon
    })
    return map
  }, [socialOptions])

  const toSocialSlug = (value) => {
    const raw = String(value ?? '').trim()
    if (!raw) return ''
    const direct = socialIndex[raw] || socialIndex[raw.toLowerCase()]
    if (direct?.slug) return direct.slug
    const normalized = normalizeKey(raw)
    return socialIndex[normalized]?.slug ?? ''
  }

  const getLinkSlug = (link) =>
    toSocialSlug(link?.slug) || toSocialSlug(link?.label)

  const normalizedLinks = useMemo(
    () =>
      links.map((link) => {
        const slug = toSocialSlug(link.slug) || toSocialSlug(link.label)
        if (!slug) return link
        const title = socialIndex[slug]?.title ?? link.label
        return { ...link, slug, label: title || link.label }
      }),
    [links, socialIndex],
  )

  const selected = new Set(
    normalizedLinks.map((link) => link.slug).filter(Boolean),
  )

  const updateLinks = (next) => updateSection(section.id, { links: next })

const addSocial = (icon) => {
    if (selected.has(icon.slug)) return
    
    // Define the sample value based on the icon slug
    const sampleUrls = {
      discord: 'https://discord.gg/yourserver',
      gmail: 'mailto:yourname@gmail.com',
      github: 'https://github.com/yourusername',
      linkedin: 'https://linkedin.com/in/yourusername',
      twitter: 'https://x.com/yourusername',
      instagram: 'https://instagram.com/yourusername'
    }

    const defaultUrl = sampleUrls[icon.slug] || 'https://example.com'

    updateLinks([
      ...normalizedLinks,
      { 
        label: icon.title, 
        slug: icon.slug, 
        url: defaultUrl
      },
    ])
  }

  const removeSocial = (slug) => {
    updateLinks(
      normalizedLinks.filter((link) => getLinkSlug(link) !== slug),
    )
  }

  const toggleSocial = (icon) => {
    if (selected.has(icon.slug)) removeSocial(icon.slug)
    else addSocial(icon)
  }

  const updateLink = (slug, field, value) => {
    const next = normalizedLinks.map((link) => {
      const linkSlug = getLinkSlug(link)
      if (linkSlug !== slug) return link
      return { ...link, slug: linkSlug, [field]: value }
    })
    updateLinks(next)
  }

  const categories = useMemo(() => {
    const set = new Set(
      socialOptions.map((icon) => icon.category).filter(Boolean),
    )
    return ['All', ...Array.from(set).sort()]
  }, [socialOptions])

  const filteredOptions = useMemo(() => {
    const term = query.trim().toLowerCase()
    return socialOptions.filter((icon) => {
      const matchesQuery = term
        ? `${icon.title} ${icon.slug} ${icon.category}`.toLowerCase().includes(term)
        : true
      const matchesCategory = activeCategory === 'All' || icon.category === activeCategory
      return matchesQuery && matchesCategory
    })
  }, [query, activeCategory, socialOptions])

  const PAGE_SIZE = 24
  const totalPages = Math.max(1, Math.ceil(filteredOptions.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const visibleOptions = filteredOptions.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <div className="grid gap-4">
      <div className="grid gap-4">
        <RangeField
          label="Icon Size"
          min={18}
          max={64}
          value={c.iconSize ?? 40}
          onChange={(v) => updateSection(section.id, { iconSize: v })}
        />
        <RangeField
          label="Icon Spacing"
          min={0}
          max={20}
          value={c.iconSpacing ?? 2}
          onChange={(v) => updateSection(section.id, { iconSpacing: v })}
        />
        <Field label="Alignment">
          <select
            className={inputClass}
            value={c.align ?? 'left'}
            onChange={(e) => updateSection(section.id, { align: e.target.value })}
          >
            {['left', 'center', 'right'].map((align) => (
              <option key={align} value={align}>{align}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Search Socials">
        <input
          className={inputClass}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setPage(1)
          }}
          placeholder="Search by name or slug"
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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {visibleOptions.map((icon) => {
          const isActive = selected.has(icon.slug)
          return (
            <button
              key={icon.slug}
              type="button"
              onClick={() => toggleSocial(icon)}
              className={`flex cursor-pointer flex-col gap-1.5 rounded-lg border p-2.5 text-center text-[11px] transition-all duration-150 select-none ${
                isActive
                  ? 'border-blue-500 bg-blue-500/15 text-zinc-50'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400'
              }`}
              title={`${icon.title} · ${icon.category}`}
            >
              <img
                src={`https://skillicons.dev/icons?i=${icon.slug}`}
                alt={icon.title}
                className="h-6.5 w-6.5 self-center"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = fallbackIcon
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
      <div className="grid gap-2.5">
        {normalizedLinks.map((link, index) => {
          const slug = getLinkSlug(link)
          if (!slug) return null
          const icon = socialIndex[slug]
          const title = link.label || icon?.title || `Link ${index + 1}`
          return (
            <div
              key={`${slug}-${index}`}
              className="grid gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 select-none">
                  <img
                    src={`https://skillicons.dev/icons?i=${slug}`}
                    alt={title}
                    className="h-5 w-5"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = fallbackIcon
                    }}
                  />
                  <span className={labelClass}>{title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeSocial(slug)}
                  className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 text-zinc-500 transition-all duration-150 hover:border-red-500 hover:text-red-500 cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <input
                className={inputClass}
                value={link.url ?? ''}
                onChange={(e) => updateLink(slug, 'url', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

const TextEditor = ({ section, updateSection }) => {
  const c = section.content ?? {}
  return (
    <div className="grid gap-3">
      <Field label="Text">
        <textarea
          className={`${inputClass} min-h-25 resize-y`}
          value={c.text ?? ''}
          onChange={(e) => updateSection(section.id, { text: e.target.value })}
          placeholder="Drop in a short callout or statement."
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Text Size">
          <select
            className={inputClass}
            value={c.size ?? 'p'}
            onChange={(e) => updateSection(section.id, { size: e.target.value })}
          >
            {['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((size) => (
              <option key={size} value={size}>{size.toUpperCase()}</option>
            ))}
          </select>
        </Field>
        <Field label="Alignment">
          <select
            className={inputClass}
            value={c.align ?? 'left'}
            onChange={(e) => updateSection(section.id, { align: e.target.value })}
          >
            {['left', 'center', 'right'].map((align) => (
              <option key={align} value={align}>{align}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  )
}

const BADGE_TYPES = [
  { type: 'profile-views', label: 'Profile Views' },
  { type: 'followers', label: 'Followers' },
  { type: 'stars', label: 'Stars' },
  { type: 'custom', label: 'Custom Badge' },
]

const BADGE_STYLES = ['for-the-badge', 'flat', 'flat-square', 'plastic', 'social']

const SortableBadge = ({ id, badge, index, updateBadge, removeBadge }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid gap-2 rounded-lg border p-3 ${
        isDragging
          ? 'z-50 border-blue-500 bg-zinc-900 opacity-80 shadow-lg'
          : 'border-zinc-800 bg-zinc-950'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className={`flex h-7 w-7 items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 text-zinc-500 transition-all duration-150 ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            aria-label="Drag to reorder"
          >
            <GripVertical size={14} />
          </button>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">{badge.type}</span>
        </div>
        <button
          type="button"
          onClick={() => removeBadge(index)}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 text-zinc-500 transition-all duration-150 hover:border-red-500 hover:text-red-500 cursor-pointer"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <input
        className={inputClass}
        value={badge.label ?? ''}
        onChange={(e) => updateBadge(index, 'label', e.target.value)}
        placeholder="Label"
      />
      {badge.type === 'custom' && (
        <input
          className={inputClass}
          value={badge.message ?? ''}
          onChange={(e) => updateBadge(index, 'message', e.target.value)}
          placeholder="Message/Value"
        />
      )}
      <div className="grid grid-cols-2 gap-2">
        <ColorField label="Color" value={`#${badge.color ?? '58a6ff'}`} onChange={(v) => updateBadge(index, 'color', v.replace('#', ''))} />
        <Field label="Style">
          <select
            className={inputClass}
            value={badge.style ?? 'for-the-badge'}
            onChange={(e) => updateBadge(index, 'style', e.target.value)}
          >
            {BADGE_STYLES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  )
}

const BadgesEditor = ({ section, updateSection }) => {
  const c = section.content ?? {}
  const items = c.items ?? []
  const [selectedType, setSelectedType] = useState('profile-views')
  
  React.useEffect(() => {
    if (items.some(b => !b.id)) {
      const newItems = items.map(b => b.id ? b : { ...b, id: Math.random().toString(36).substring(7) })
      updateSection(section.id, { items: newItems })
    }
  }, [items, section.id, updateSection])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        updateSection(section.id, { items: arrayMove(items, oldIndex, newIndex) })
      }
    }
  }

  const addBadge = () => {
    const newBadge = {
      id: Math.random().toString(36).substring(7),
      type: selectedType,
      label: BADGE_TYPES.find(b => b.type === selectedType)?.label || 'Badge',
      color: '58a6ff',
      style: 'for-the-badge',
      message: selectedType === 'custom' ? 'Value' : '',
    }
    updateSection(section.id, { items: [...items, newBadge] })
  }
  
  const removeBadge = (index) => {
    updateSection(section.id, { items: items.filter((_, i) => i !== index) })
  }
  
  const updateBadge = (index, field, value) => {
    const next = items.map((badge, i) => i === index ? { ...badge, [field]: value } : badge)
    updateSection(section.id, { items: next })
  }
  
  return (
    <div className="grid gap-4">
      <Field label="GitHub Username">
        <input
          className={inputClass}
          value={c.username ?? ''}
          onChange={(e) => updateSection(section.id, { username: e.target.value })}
          placeholder="BrandonBlkk"
        />
      </Field>
      <Field label="Alignment">
        <select
          className={inputClass}
          value={c.align ?? 'left'}
          onChange={(e) => updateSection(section.id, { align: e.target.value })}
        >
          {['left', 'center', 'right'].map((align) => (
            <option key={align} value={align}>{align}</option>
          ))}
        </select>
      </Field>
      <div className="flex gap-2">
        <Field label="Add Badge">
          <select
            className={inputClass}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {BADGE_TYPES.map((b) => (
              <option key={b.type} value={b.type}>{b.label}</option>
            ))}
          </select>
        </Field>
        <button
          type="button"
          onClick={addBadge}
          className="mt-5.5 h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400 transition-all duration-150 hover:border-blue-500 hover:text-blue-400 cursor-pointer select-none"
        >
          Add
        </button>
      </div>
      <div className="grid gap-2.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(b => b.id).filter(Boolean)} strategy={verticalListSortingStrategy}>
            {items.map((badge, index) => {
              if (!badge.id) return null
              return (
                <SortableBadge
                  key={badge.id}
                  id={badge.id}
                  badge={badge}
                  index={index}
                  updateBadge={updateBadge}
                  removeBadge={removeBadge}
                />
              )
            })}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}

const SortableRepo = ({ id, repo, index, updateRepo, removeRepo }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const [localValue, setLocalValue] = useState(repo)

  React.useEffect(() => {
    setLocalValue(repo)
  }, [repo])

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleBlur = () => {
    const trimmed = localValue.trim()
    if (trimmed && trimmed !== repo) {
      updateRepo(index, trimmed)
    } else if (!trimmed || trimmed === repo) {
      setLocalValue(repo)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
        isDragging
          ? 'z-50 border-blue-500 bg-zinc-900 opacity-80 shadow-lg'
          : 'border-zinc-800 bg-zinc-950'
      }`}
    >
      <div className="flex flex-1 items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className={`flex h-6 w-6 items-center justify-center rounded-md hover:bg-zinc-800 text-zinc-500 transition-colors hover:text-zinc-300 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          aria-label="Drag to reorder"
        >
          <GripVertical size={14} />
        </button>
        <input
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-[13px] text-zinc-300 outline-none focus:text-zinc-100"
          placeholder="repository-name"
        />
      </div>
      <button
        type="button"
        onClick={() => removeRepo(index)}
        className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-800 text-zinc-500 transition-all duration-150 hover:border-red-500 hover:text-red-500 cursor-pointer ml-2"
      >
        <Trash2 size={12} />
      </button>
    </div>
  )
}

const ReposEditor = ({ section, updateSection }) => {
  const c = section.content ?? {}
  const repos = c.repos ?? []
  const [newRepo, setNewRepo] = useState('')
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = repos.indexOf(active.id)
      const newIndex = repos.indexOf(over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        updateSection(section.id, { repos: arrayMove(repos, oldIndex, newIndex) })
      }
    }
  }

  const addRepo = () => {
    const trimmed = newRepo.trim()
    if (!trimmed) return
    if (repos.includes(trimmed)) {
      toast.error('Repository already exists')
      return
    }
    updateSection(section.id, { repos: [...repos, trimmed] })
    setNewRepo('')
  }
  
  const removeRepo = (index) => {
    updateSection(section.id, { repos: repos.filter((_, i) => i !== index) })
  }
  
  const updateRepo = (index, newValue) => {
    if (repos.includes(newValue) && repos.indexOf(newValue) !== index) {
      toast.error('Repository already exists')
      return
    }
    const next = [...repos]
    next[index] = newValue
    updateSection(section.id, { repos: next })
  }
  
  return (
    <div className="grid gap-4">
      <Field label="GitHub Username">
        <input
          className={inputClass}
          value={c.username ?? ''}
          onChange={(e) => updateSection(section.id, { username: e.target.value })}
          placeholder="BrandonBlkk"
        />
      </Field>
      <Field label="Theme">
        <select
          className={inputClass}
          value={c.theme ?? 'dracula'}
          onChange={(e) => updateSection(section.id, { theme: e.target.value })}
        >
          {['dark', 'transparent', 'tokyonight', 'radical', 'onedark', 'cobalt', 'nightowl', 'dracula'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Toggle label="Hide Border" checked={c.hideBorder !== false} onChange={(v) => updateSection(section.id, { hideBorder: v })} />
      <Field label="Alignment">
        <select
          className={inputClass}
          value={c.align ?? 'center'}
          onChange={(e) => updateSection(section.id, { align: e.target.value })}
        >
          {['left', 'center', 'right'].map((align) => (
            <option key={align} value={align}>{align}</option>
          ))}
        </select>
      </Field>
      <div className="flex gap-2">
        <Field label="Add Repository">
          <input
            className={inputClass}
            value={newRepo}
            onChange={(e) => setNewRepo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRepo()}
            placeholder="repository-name"
          />
        </Field>
        <button
          type="button"
          onClick={addRepo}
          className="mt-5.5 h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400 transition-all duration-150 hover:border-blue-500 hover:text-blue-400 cursor-pointer select-none"
        >
          Add
        </button>
      </div>
      <div className="grid gap-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={repos} strategy={verticalListSortingStrategy}>
            {repos.map((repo, index) => (
              <SortableRepo
                key={repo}
                id={repo}
                repo={repo}
                index={index}
                updateRepo={updateRepo}
                removeRepo={removeRepo}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      {repos.length === 0 && (
        <p className="text-[11px] text-zinc-600">Add your pinned repository names (e.g., &quot;my-awesome-project&quot;)</p>
      )}
    </div>
  )
}

const SNIPPET_TYPES = [
  { type: 'currently-learning', label: 'Currently Learning', emoji: '📚' },
  { type: 'currently-working', label: 'Currently Working On', emoji: '🔭' },
  { type: 'fun-facts', label: 'Fun Facts', emoji: '⚡' },
  { type: 'ask-me-about', label: 'Ask Me About', emoji: '💬' },
  { type: 'how-to-reach', label: 'How to Reach Me', emoji: '📫' },
  { type: 'pronouns', label: 'Pronouns', emoji: '😄' },
  { type: 'goals', label: 'Goals for This Year', emoji: '🎯' },
]

const SnippetEditor = ({ section, updateSection }) => {
  const c = section.content ?? {}
  const items = c.items ?? []
  const [newItem, setNewItem] = useState('')
  
  const addItem = () => {
    if (!newItem.trim()) return
    updateSection(section.id, { items: [...items, newItem.trim()] })
    setNewItem('')
  }
  
  const removeItem = (index) => {
    updateSection(section.id, { items: items.filter((_, i) => i !== index) })
  }
  
  const selectedSnippet = SNIPPET_TYPES.find(s => s.type === c.type) || SNIPPET_TYPES[0]
  
  return (
    <div className="grid gap-4">
      <Field label="Snippet Type">
        <select
          className={inputClass}
          value={c.type ?? 'currently-learning'}
          onChange={(e) => updateSection(section.id, { type: e.target.value })}
        >
          {SNIPPET_TYPES.map((s) => (
            <option key={s.type} value={s.type}>{s.emoji} {s.label}</option>
          ))}
        </select>
      </Field>
      <Field label="Alignment">
        <select
          className={inputClass}
          value={c.align ?? 'left'}
          onChange={(e) => updateSection(section.id, { align: e.target.value })}
        >
          {['left', 'center', 'right'].map((align) => (
            <option key={align} value={align}>{align}</option>
          ))}
        </select>
      </Field>
      <div className="flex gap-2">
        <Field label={`Add ${selectedSnippet.label} Item`}>
          <input
            className={inputClass}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder={c.type === 'currently-learning' ? 'e.g., Next.js' : 'Enter item...'}
          />
        </Field>
        <button
          type="button"
          onClick={addItem}
          className="mt-5.5 h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400 transition-all duration-150 hover:border-blue-500 hover:text-blue-400 cursor-pointer select-none"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950 py-1 pl-3 pr-1">
            <span className="text-[12px] text-zinc-300">{item}</span>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="flex h-5 w-5 items-center justify-center rounded-full text-zinc-500 transition-all duration-150 hover:text-red-500 cursor-pointer"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <p className="text-[11px] text-zinc-600">Add items that will appear as inline code tags</p>
      )}
    </div>
  )
}

const SectionEditor = ({ section, updateSection, buildStatsUrl, techOptions, socialOptions, fallbackIcon }) => {
  switch (section.type) {
    case 'header': return <HeaderEditor section={section} updateSection={updateSection} />
    case 'about': return <AboutEditor section={section} updateSection={updateSection} />
    case 'stats': return <StatsEditor section={section} updateSection={updateSection} buildStatsUrl={buildStatsUrl} />
    case 'badges': return <BadgesEditor section={section} updateSection={updateSection} />
    case 'repos': return <ReposEditor section={section} updateSection={updateSection} />
    case 'snippet': return <SnippetEditor section={section} updateSection={updateSection} />
    case 'skills': return <SkillsEditor section={section} updateSection={updateSection} techOptions={techOptions} fallbackIcon={fallbackIcon} />
    case 'socials': return <SocialsEditor section={section} updateSection={updateSection} socialOptions={socialOptions} fallbackIcon={fallbackIcon} />
    case 'text': return <TextEditor section={section} updateSection={updateSection} />
    default: return null
  }
}

export default SectionEditor

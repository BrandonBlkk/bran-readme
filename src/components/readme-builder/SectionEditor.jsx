import React, { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Toggle from '../Toggle'
import { Field, RangeField, ColorField, inputClass, labelClass } from './FormFields'

const HeaderEditor = ({ section, updateSection }) => {
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

const StatsEditor = ({ section, updateSection, buildStatsUrl }) => {
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

const SkillsEditor = ({ section, updateSection, techOptions, fallbackIcon }) => {
  const c = section.content ?? {}
  const selected = new Set(c.items ?? [])
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [page, setPage] = useState(1)

  const categories = useMemo(() => {
    const set = new Set(
      techOptions.map((icon) => icon.category).filter(Boolean),
    )
    return ['All', ...Array.from(set).sort()]
  }, [techOptions])

  const filteredOptions = useMemo(() => {
    const term = query.trim().toLowerCase()
    return techOptions.filter((icon) => {
      const matchesQuery = term
        ? `${icon.title} ${icon.slug} ${icon.category}`.toLowerCase().includes(term)
        : true
      const matchesCategory = activeCategory === 'All' || icon.category === activeCategory
      return matchesQuery && matchesCategory
    })
  }, [query, activeCategory, techOptions])

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
                src={`https://cdn.simpleicons.org/${icon.slug}`}
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
    </div>
  )
}

const SocialsEditor = ({ section, updateSection }) => {
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

const AboutEditor = ({ section, updateSection }) => {
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

const SectionEditor = ({ section, updateSection, buildStatsUrl, techOptions, fallbackIcon }) => {
  switch (section.type) {
    case 'header': return <HeaderEditor section={section} updateSection={updateSection} />
    case 'stats': return <StatsEditor section={section} updateSection={updateSection} buildStatsUrl={buildStatsUrl} />
    case 'skills': return <SkillsEditor section={section} updateSection={updateSection} techOptions={techOptions} fallbackIcon={fallbackIcon} />
    case 'socials': return <SocialsEditor section={section} updateSection={updateSection} />
    case 'about': return <AboutEditor section={section} updateSection={updateSection} />
    default: return null
  }
}

export default SectionEditor

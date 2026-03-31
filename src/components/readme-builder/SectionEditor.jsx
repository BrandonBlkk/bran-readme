import React, { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
        <Toggle label="Show Git Stats" checked={c.showMainStats !== false} onChange={(v) => updateSection(section.id, { showMainStats: v })} />
        <Toggle label="Show Languages" checked={c.showLanguageStats !== false} onChange={(v) => updateSection(section.id, { showLanguageStats: v })} />
        <Toggle label="Show Trophies" checked={c.showTrophyStats !== false} onChange={(v) => updateSection(section.id, { showTrophyStats: v })} />
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

const SectionEditor = ({ section, updateSection, buildStatsUrl, techOptions, socialOptions, fallbackIcon }) => {
  switch (section.type) {
    case 'header': return <HeaderEditor section={section} updateSection={updateSection} />
    case 'about': return <AboutEditor section={section} updateSection={updateSection} />
    case 'stats': return <StatsEditor section={section} updateSection={updateSection} buildStatsUrl={buildStatsUrl} />
    case 'skills': return <SkillsEditor section={section} updateSection={updateSection} techOptions={techOptions} fallbackIcon={fallbackIcon} />
    case 'socials': return <SocialsEditor section={section} updateSection={updateSection} socialOptions={socialOptions} fallbackIcon={fallbackIcon} />
    case 'text': return <TextEditor section={section} updateSection={updateSection} />
    default: return null
  }
}

export default SectionEditor

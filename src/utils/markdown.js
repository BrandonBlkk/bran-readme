import { techData } from './tech-data'
import { socialData } from './social-data'

export const FALLBACK_ICON = 'https://cdn.simpleicons.org/simpleicons/999'

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

const TEXT_TAGS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
const TEXT_ALIGNMENTS = ['left', 'center', 'right']

export const TECH_OPTIONS = techData.map((icon) => ({
  title: icon.name,
  slug: icon.slug,
  category: icon.category,
}))

const TECH_ICON_MAP = TECH_OPTIONS.reduce((acc, icon) => {
  acc[icon.slug] = icon
  return acc
}, {})

export const SOCIAL_OPTIONS = socialData.map((icon) => ({
  title: icon.name,
  slug: icon.slug,
  category: icon.category,
}))

const SOCIAL_ICON_MAP = SOCIAL_OPTIONS.reduce((acc, icon) => {
  acc[icon.slug] = icon
  return acc
}, {})

const normalizeKey = (value) =>
  String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

const SOCIAL_SLUG_MAP = SOCIAL_OPTIONS.reduce((acc, icon) => {
  acc[icon.slug.toLowerCase()] = icon.slug
  acc[normalizeKey(icon.slug)] = icon.slug
  acc[icon.title.toLowerCase()] = icon.slug
  acc[normalizeKey(icon.title)] = icon.slug
  return acc
}, {})

const toSkillIconsSlug = (value) => {
  const slug = String(value ?? '')
  if (!slug) return ''
  if (SKILLICONS_OVERRIDES[slug]) return SKILLICONS_OVERRIDES[slug]
  if (slug.endsWith('dotjs')) return slug.replace(/dotjs$/, 'js')
  return slug
}

const toSocialSlug = (value) => {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  const key = raw.toLowerCase()
  if (SOCIAL_SLUG_MAP[key]) return SOCIAL_SLUG_MAP[key]
  const normalized = normalizeKey(raw)
  return SOCIAL_SLUG_MAP[normalized] ?? ''
}

const sanitizeHex = (value) => String(value ?? '').replace('#', '').trim()
const clampNumber = (value, min, max, fallback) => {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return fallback
  return Math.min(max, Math.max(min, numeric))
}

export const buildStatsUrl = (content) => {
  const url = new URL('https://github-readme-stats-delta-eight-12.vercel.app/api')
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

const buildLanguageStatsUrl = (content) => {
  const url = new URL('https://github-readme-stats-delta-eight-12.vercel.app/api/top-langs')
  if (content.username) url.searchParams.set('username', content.username)
  if (content.theme) url.searchParams.set('theme', content.theme)
  if (content.hideBorder) url.searchParams.set('hide_border', 'true')
  if (content.bgColor) url.searchParams.set('bg_color', sanitizeHex(content.bgColor))
  if (content.titleColor) url.searchParams.set('title_color', sanitizeHex(content.titleColor))
  if (content.textColor) url.searchParams.set('text_color', sanitizeHex(content.textColor))
  if (content.borderRadius !== undefined)
    url.searchParams.set('border_radius', String(content.borderRadius))
  url.searchParams.set('layout', 'compact')
  return url.toString()
}

const buildTrophyStatsUrl = (content) => {
  const url = new URL('https://github-profile-trophy.screw-hand.vercel.app/')
  if (content.username) url.searchParams.set('username', content.username)
  const statsTheme = String(content.theme ?? '').toLowerCase()
  const trophyTheme =
    statsTheme === 'tokyonight' || statsTheme === 'radical' || statsTheme === 'dracula'
      ? statsTheme
      : 'onestar'
  url.searchParams.set('theme', trophyTheme)
  if (content.hideBorder) url.searchParams.set('no-frame', 'true')
  if (content.bgColor || statsTheme === 'transparent') url.searchParams.set('no-bg', 'true')
  url.searchParams.set('margin-w', '0')
  url.searchParams.set('margin-h', '8')
  return url.toString()
}

const getStatsCardDimensions = (content) => {
  const widthScale = clampNumber(content.cardWidth, 300, 600, 420) / 420
  const heightScale = clampNumber(content.lineHeight, 18, 40, 28) / 28

  return {
    width: Math.round(390 * widthScale),
    height: Math.round(195 * heightScale),
  }
}

const buildWebsiteBadge = (website) => {
  const badgeUrl = new URL('https://img.shields.io/static/v1')
  badgeUrl.searchParams.set('label', '')
  badgeUrl.searchParams.set('message', 'Portfolio')
  badgeUrl.searchParams.set('color', '#FF2056')
  badgeUrl.searchParams.set('style', 'flat-square')
  badgeUrl.searchParams.set('logo', 'googlechrome')
  badgeUrl.searchParams.set('logoColor', 'white')
  return `<a href="${website}"><img src="${badgeUrl.toString()}" alt="Portfolio" height="24" /></a>`
}

const headerBlock = (c) => {
  const lines = []
  if (c.name) lines.push(`# ${c.name}`)
  if (c.tagline) lines.push(c.tagline)
  const meta = []
  if (c.location) meta.push(`Location: ${c.location}`)
  if (c.website) meta.push(buildWebsiteBadge(c.website))
  if (meta.length) lines.push(meta.join(' | '))
  return lines.join('\n\n')
}

const statsBlock = (c) => {
  const mainCard = c.showMainStats !== false
    ? { alt: 'GitHub Stats', src: buildStatsUrl(c) }
    : null
  const languageCard = c.showLanguageStats !== false
    ? { alt: 'Top Languages', src: buildLanguageStatsUrl(c) }
    : null
  const trophyCard = c.showTrophyStats !== false
    ? { alt: 'GitHub Trophies', src: buildTrophyStatsUrl(c) }
    : null

  if (!mainCard && !languageCard && !trophyCard) return 'Enable at least one GitHub card.'

  const { width: cardWidth, height: cardHeight } = getStatsCardDimensions(c)
  const trophyWidth = 650
  const renderTopCard = (card) =>
    `<img src="${card.src}" alt="${card.alt}" width="${cardWidth}" height="${cardHeight}" />`
  const renderTrophyCard = (card) =>
    `<img src="${card.src}" alt="${card.alt}" width="${trophyWidth}" />`
  const topRowCards = [mainCard, languageCard].filter(Boolean)
  const topRow = topRowCards.length === 2
    ? `<div align="center">\n${topRowCards.map(renderTopCard).join('\n')}\n</div>`
    : topRowCards.length === 1
      ? `<div align="center">\n${renderTopCard(topRowCards[0])}\n</div>`
      : ''
  const bottomRow = trophyCard
    ? `<div align="center">\n${renderTrophyCard(trophyCard)}\n</div>`
    : ''
  const indentBlock = (block, baseDepth = 1) => {
    let depth = 0
    return String(block ?? '')
      .split('\n')
      .map((line) => {
        const trimmed = line.trim()
        if (!trimmed) return ''

        if (trimmed.startsWith('</')) {
          depth = Math.max(0, depth - 1)
        }

        const indented = `${'\t'.repeat(baseDepth + depth)}${trimmed}`

        const isOpeningTag = /^<([a-z][^/\s>]*)\b[^>]*>$/i.test(trimmed)
        const isSelfClosing = /\/>$/.test(trimmed)
        if (isOpeningTag && !isSelfClosing) {
          depth += 1
        }

        return indented
      })
      .join('\n')
  }

  return [
    '<div align="center">',
    topRow ? indentBlock(topRow) : '',
    topRow && bottomRow ? '\t<br />' : '',
    bottomRow ? indentBlock(bottomRow) : '',
    '</div>',
  ]
    .filter(Boolean)
    .join('\n')
}

const skillsBlock = (c) => {
  const items = (c.items ?? [])
    .map((slug) => TECH_ICON_MAP[slug] ?? { title: slug, slug })
    .filter(Boolean)
  if (!items.length) return 'Add your tech stack icons.'
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
  return `${icons}`
}

const socialsBlock = (c) => {
  const links = (c.links ?? [])
    .map((link) => ({
      ...link,
      slug: link.slug || toSocialSlug(link.label),
    }))
    .filter((l) => l.label && l.url)
  if (!links.length) return 'Add your social links.'
  const iconLinks = links.filter((l) => l.slug)
  const textLinks = links.filter((l) => !l.slug)
  const iconSize = 28
  const icons = iconLinks
    .map((link) => {
      const slug = link.slug || toSocialSlug(link.label)
      const src = slug ? `https://skillicons.dev/icons?i=${slug}` : FALLBACK_ICON
      const label = link.label || (SOCIAL_ICON_MAP[slug]?.title ?? slug)
      return `<a href="${link.url}"><img src="${src}" alt="${label}" width="${iconSize}" height="${iconSize}" /></a>`
    })
    .join('&nbsp;&nbsp;')
  const list = textLinks.length
    ? textLinks.map((l) => `- [${l.label}](${l.url})`).join('\n')
    : ''
  if (icons && list) return `${icons}\n\n${list}`
  if (icons) return icons
  return list
}

const aboutBlock = (c) => {
  if (!c.text) return ''
  return `${c.text}`
}

const textBlock = (c) => {
  const raw = String(c.text ?? '').trim()
  if (!raw) return ''
  const tagCandidate = String(c.size ?? 'p').toLowerCase()
  const tag = TEXT_TAGS.includes(tagCandidate) ? tagCandidate : 'p'
  const alignCandidate = String(c.align ?? 'left').toLowerCase()
  const align = TEXT_ALIGNMENTS.includes(alignCandidate) ? alignCandidate : 'left'
  const alignAttr = align !== 'left' ? ` align="${align}"` : ''
  const dividerAttr = ` data-divider="${c.divider !== false}"`
  const text = raw.replace(/\r?\n/g, '<br />')
  return `<${tag}${alignAttr}${dividerAttr}>${text}</${tag}>`
}

export const generateMarkdown = (sections) =>
  sections
    .map((s) => {
      const c = s.content ?? {}
      switch (s.type) {
        case 'header': return headerBlock(c)
        case 'stats': return statsBlock(c)
        case 'skills': return skillsBlock(c)
        case 'socials': return socialsBlock(c)
        case 'about': return aboutBlock(c)
        case 'text': return textBlock(c)
        default: return ''
      }
    })
    .filter(Boolean)
    .join('\n\n')

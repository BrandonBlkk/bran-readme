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
const getIconSize = (value, fallback = 40) =>
  Math.round(clampNumber(value, 18, 40, fallback))
const getIconSpacing = (value, fallback = 1) =>
  Math.round(clampNumber(value, 0, 6, fallback))
const getContentAlign = (value, fallback = 'left') => {
  const candidate = String(value ?? fallback).toLowerCase()
  return TEXT_ALIGNMENTS.includes(candidate) ? candidate : fallback
}
const buildIconSpacer = (value, fallback = 1) => {
  const spacing = getIconSpacing(value, fallback)
  return spacing > 0 ? `<span>${'&nbsp;'.repeat(spacing)}</span>` : ''
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

export const buildStreakUrl = (content) => {
  const url = new URL('https://github-readme-streak-stats.herokuapp.com/')
  if (content.username) url.searchParams.set('user', content.username)
  if (content.theme) url.searchParams.set('theme', content.theme)
  if (content.hideBorder) url.searchParams.set('hide_border', 'true')
  if (content.bgColor) url.searchParams.set('background', sanitizeHex(content.bgColor))
  if (content.strokeColor) url.searchParams.set('stroke', sanitizeHex(content.strokeColor))
  if (content.ringColor) url.searchParams.set('ring', sanitizeHex(content.ringColor))
  if (content.fireColor) url.searchParams.set('fire', sanitizeHex(content.fireColor))
  if (content.currStreakColor) url.searchParams.set('currStreakNum', sanitizeHex(content.currStreakColor))
  if (content.sideNumColor) url.searchParams.set('sideNums', sanitizeHex(content.sideNumColor))
  if (content.sideLabelsColor) url.searchParams.set('sideLabels', sanitizeHex(content.sideLabelsColor))
  if (content.dateColor) url.searchParams.set('dates', sanitizeHex(content.dateColor))
  if (content.borderRadius !== undefined) url.searchParams.set('border_radius', String(content.borderRadius))
  return url.toString()
}

export const buildActivityUrl = (content) => {
  const url = new URL('https://github-readme-activity-graph.vercel.app/graph')
  if (content.username) url.searchParams.set('username', content.username)
  if (content.theme) url.searchParams.set('theme', content.theme)
  if (content.bgColor) url.searchParams.set('bg_color', sanitizeHex(content.bgColor))
  if (content.lineColor) url.searchParams.set('line', sanitizeHex(content.lineColor))
  if (content.pointColor) url.searchParams.set('point', sanitizeHex(content.pointColor))
  if (content.areaColor) url.searchParams.set('area_color', sanitizeHex(content.areaColor))
  if (content.hideBorder) url.searchParams.set('hide_border', 'true')
  if (content.hideGrid) url.searchParams.set('hide_grid', 'true')
  if (content.area === true) url.searchParams.set('area', 'true')
  if (content.radius !== undefined) url.searchParams.set('radius', String(content.radius))
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
  badgeUrl.searchParams.set('message', 'PORTFOLIO') 
  badgeUrl.searchParams.set('color', '#FF2056')
  badgeUrl.searchParams.set('style', 'for-the-badge')
  badgeUrl.searchParams.set('logo', 'buymeacoffee')
  badgeUrl.searchParams.set('logoColor', 'white')
  
  return `<a href="${website}" target="_blank"><img src="${badgeUrl.toString()}" alt="Portfolio" align="absmiddle" /></a>`
}

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

const buildAlignedBlock = (align, content) => [
  `<div align="${align}">`,
  indentBlock(content),
  '</div>',
]
  .filter((line) => String(line ?? '').trim().length > 0)
  .join('\n')

const headerBlock = (c) => {
  const align = getContentAlign(c.align, 'left')
  const lines = []
  if (c.name) {
    lines.push(align === 'left' ? `# ${c.name}` : `<h1 align="${align}">${c.name}</h1>`)
  }
  if (c.tagline) {
    lines.push(align === 'left' ? c.tagline : `<p align="${align}">${c.tagline}</p>`)
  }
  const meta = []
  if (c.location) meta.push(`Based in ${c.location}`)
  if (c.website) meta.push(buildWebsiteBadge(c.website))

  if (meta.length) {
    lines.push(buildAlignedBlock(align, meta.join(' | ')))
  }

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
    ? buildAlignedBlock('center', topRowCards.map(renderTopCard).join('\n'))
    : topRowCards.length === 1
      ? buildAlignedBlock('center', renderTopCard(topRowCards[0]))
      : ''
  const bottomRow = trophyCard
    ? buildAlignedBlock('center', renderTrophyCard(trophyCard))
    : ''

  return buildAlignedBlock(
    'center',
    [topRow, topRow && bottomRow ? '<br />' : '', bottomRow].filter(Boolean).join('\n'),
  )
}

const streakBlock = (c) => {
  const streakUrl = buildStreakUrl(c)
  const img = `<img src="${streakUrl}" alt="GitHub Streak Stats" />`
  return buildAlignedBlock('center', img)
}

const activityBlock = (c) => {
  const activityUrl = buildActivityUrl(c)
  const img = `<img src="${activityUrl}" alt="GitHub Activity Graph" width="100%" />`
  return buildAlignedBlock('center', img)
}

const badgesBlock = (c) => {
  const items = c.items ?? []
  if (!items.length) return 'Add some badges to display.'
  const align = getContentAlign(c.align, 'left')
  
  const badges = items.map((badge) => {
    const username = c.username || 'BrandonBlkk'
    const color = badge.color || '58a6ff'
    const style = badge.style || 'for-the-badge'
    
    switch (badge.type) {
      case 'profile-views':
        return `<img src="https://komarev.com/ghpvc/?username=${username}&color=${color}&style=${style}&label=${encodeURIComponent(badge.label || 'Profile Views')}" alt="Profile Views" />`
      case 'followers':
        return `<img src="https://img.shields.io/github/followers/${username}?label=${encodeURIComponent(badge.label || 'Followers')}&style=${style}&color=${color}" alt="Followers" />`
      case 'stars':
        return `<img src="https://img.shields.io/github/stars/${username}?label=${encodeURIComponent(badge.label || 'Stars')}&style=${style}&color=${color}" alt="Stars" />`
      case 'repos':
        return `<img src="https://badges.frapsoft.com/os/v2/open-source.svg?v=103" alt="Open Source" />`
      case 'custom':
        return `<img src="https://img.shields.io/static/v1?label=${encodeURIComponent(badge.label || 'Badge')}&message=${encodeURIComponent(badge.message || 'Value')}&color=${color}&style=${style}" alt="${badge.label || 'Custom Badge'}" />`
      default:
        return `<img src="https://img.shields.io/static/v1?label=${encodeURIComponent(badge.label || 'Badge')}&message=${encodeURIComponent(badge.message || '')}&color=${color}&style=${style}" alt="${badge.label}" />`
    }
  }).join('\n')
  
  return buildAlignedBlock(align, badges)
}

const reposBlock = (c) => {
  const username = c.username || 'BrandonBlkk'
  const repos = c.repos ?? []
  const align = getContentAlign(c.align, 'center')
  
  if (!repos.length) {
    return buildAlignedBlock(align, `<p><em>Add pinned repository names to display them here.</em></p>`)
  }
  
  const repoCards = repos.map((repo) => {
    const repoName = typeof repo === 'string' ? repo : repo.name
    return `<a href="https://github.com/${username}/${repoName}"><img src="https://github-readme-stats-delta-eight-12.vercel.app/api/pin/?username=${username}&repo=${repoName}&theme=${c.theme || 'dark'}&hide_border=${c.hideBorder !== false}" alt="${repoName}" /></a>`
  }).join('\n')
  
  return buildAlignedBlock(align, repoCards)
}

const snippetBlock = (c) => {
  const type = c.type || 'currently-learning'
  const items = c.items ?? []
  const align = getContentAlign(c.align, 'left')
  
  const SNIPPET_TITLES = {
    'currently-learning': 'Currently Learning',
    'currently-working': 'Currently Working On',
    'fun-facts': 'Fun Facts',
    'ask-me-about': 'Ask Me About',
    'how-to-reach': 'How to Reach Me',
    'pronouns': 'Pronouns',
    'goals': 'Goals for This Year',
  }
  
  const title = SNIPPET_TITLES[type] || 'Info'
  const emoji = {
    'currently-learning': '📚',
    'currently-working': '🔭',
    'fun-facts': '⚡',
    'ask-me-about': '💬',
    'how-to-reach': '📫',
    'pronouns': '😄',
    'goals': '🎯',
  }[type] || '📌'
  
  if (!items.length) {
    return `**${emoji} ${title}:** _Add some items..._`
  }
  
  const formattedItems = items.map((item) => `\`${item}\``).join(', ')
  const line = `**${emoji} ${title}:** ${formattedItems}`
  
  if (align === 'left') return line
  return `<p align="${align}">${line}</p>`
}

const skillsBlock = (c) => {
  const items = (c.items ?? [])
    .map((slug) => TECH_ICON_MAP[slug] ?? { title: slug, slug })
    .filter(Boolean)
  if (!items.length) return 'Add your tech stack icons.'
  const align = getContentAlign(c.align, 'left')
  const iconSize = getIconSize(c.iconSize, 40)
  const spacer = buildIconSpacer(c.iconSpacing, 1)
  const icons = items
    .flatMap((icon, index) => {
      const slug = toSkillIconsSlug(icon.slug)
      const src = slug
        ? `https://skillicons.dev/icons?i=${slug}&theme=dark`
        : FALLBACK_ICON
      const img = `<img src="${src}" alt="${icon.title}" width="${iconSize}" height="${iconSize}" />`
      return index < items.length - 1 && spacer ? [img, spacer] : [img]
    })
    .join('\n')

  return [`<div align="${align}">`, indentBlock(icons), '</div>'].join('\n')
}

const socialsBlock = (c) => {
  const links = (c.links ?? [])
    .map((link) => ({
      ...link,
      slug: link.slug || toSocialSlug(link.label),
    }))
    .filter((l) => l.label && l.url)
  if (!links.length) return 'Add your social links.'
  const align = getContentAlign(c.align, 'left')
  const iconLinks = links.filter((l) => l.slug)
  const textLinks = links.filter((l) => !l.slug)
  const iconSize = getIconSize(c.iconSize, 40)
  const spacer = buildIconSpacer(c.iconSpacing, 1)
  const icons = iconLinks
    .flatMap((link, index) => {
      const slug = link.slug || toSocialSlug(link.label)
      const src = slug ? `https://skillicons.dev/icons?i=${slug}` : FALLBACK_ICON
      const label = link.label || (SOCIAL_ICON_MAP[slug]?.title ?? slug)
      const icon = `<a href="${link.url}"><img src="${src}" alt="${label}" width="${iconSize}" height="${iconSize}" /></a>`
      return index < iconLinks.length - 1 && spacer ? [icon, spacer] : [icon]
    })

  const list = textLinks.map((l) => `- [${l.label}](${l.url})`).join('\n')

  const iconsBlock = icons.length
    ? [`<div align="${align}">`, indentBlock(icons.join('\n')), '</div>'].join('\n')
    : ''
  if (iconsBlock && list) return `${iconsBlock}\n\n${list}`
  if (iconsBlock) return iconsBlock
  return list
}

const aboutBlock = (c) => {
  if (!c.text) return ''
  const align = getContentAlign(c.align, 'left')
  if (align === 'left') return `${c.text}`

  return String(c.text)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p align="${align}">${paragraph.replace(/\r?\n/g, '<br />')}</p>`)
    .join('\n\n')
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
        case 'streak': return streakBlock(c)
        case 'activity': return activityBlock(c)
        case 'badges': return badgesBlock(c)
        case 'repos': return reposBlock(c)
        case 'snippet': return snippetBlock(c)
        case 'skills': return skillsBlock(c)
        case 'socials': return socialsBlock(c)
        case 'about': return aboutBlock(c)
        case 'text': return textBlock(c)
        default: return ''
      }
    })
    .filter(Boolean)
    .join('\n\n')

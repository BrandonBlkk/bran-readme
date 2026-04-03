import { hasSupabaseConfig, supabase } from '../lib/supabaseClient'
import { normalizeTemplatePayload, sanitizeTags } from '../utils/templatePayload'

const TABLE_NAME = 'templates'
const TEMPLATE_COLUMNS = `
  id,
  name,
  description,
  tags,
  sections,
  markdown,
  preview_theme,
  is_public,
  author_name,
  created_at
`

const BASE_CONTENT = {
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
    text: "Hi, I'm Brandon",
    size: 'h2',
    align: 'center',
    divider: true,
  },
}

const clone = (value) => JSON.parse(JSON.stringify(value))

const makeSections = (prefix, types) =>
  types.map((type, index) => ({
    id: `${prefix}-${type}-${index + 1}`,
    type,
    content: clone(BASE_CONTENT[type] ?? {}),
  }))

export const BUILTIN_TEMPLATES = [
  {
    id: 'builtin-starter',
    name: 'Starter Profile',
    description: 'A clean, balanced layout that works for most developer profiles.',
    tags: ['Balanced', 'Popular'],
    payload: {
      sections: makeSections('starter', ['header', 'stats', 'skills', 'socials', 'about']),
      previewTheme: 'dark',
    },
    source: 'builtin',
    authorName: 'BranReadme',
  },
  {
    id: 'builtin-minimal',
    name: 'Minimal Stack',
    description: 'Focused on essentials with a simple skills strip and short bio.',
    tags: ['Minimal', 'Fast'],
    payload: {
      sections: makeSections('minimal', ['header', 'skills', 'about']),
      previewTheme: 'dark',
    },
    source: 'builtin',
    authorName: 'BranReadme',
  },
  {
    id: 'builtin-showcase',
    name: 'Showcase',
    description: 'Highlights projects, metrics, and credibility with bold cards.',
    tags: ['Portfolio', 'Bold'],
    payload: {
      sections: makeSections('showcase', ['header', 'stats', 'skills', 'socials', 'about']),
      previewTheme: 'dark',
    },
    source: 'builtin',
    authorName: 'BranReadme',
  },
  {
    id: 'builtin-community',
    name: 'Community Builder',
    description: 'Optimized for open-source maintainers and community reach.',
    tags: ['Open Source', 'Community'],
    payload: {
      sections: makeSections('community', ['header', 'socials', 'about']),
      previewTheme: 'dark',
    },
    source: 'builtin',
    authorName: 'BranReadme',
  },
  {
    id: 'builtin-recruiter',
    name: 'Recruiter Friendly',
    description: 'Emphasizes role, impact, and tech stack for hiring managers.',
    tags: ['Career', 'Clean'],
    payload: {
      sections: makeSections('recruiter', ['header', 'stats', 'skills', 'about']),
      previewTheme: 'dark',
    },
    source: 'builtin',
    authorName: 'BranReadme',
  },
  {
    id: 'builtin-creator',
    name: 'Creator Mode',
    description: 'Perfect for creators who want links, media, and socials upfront.',
    tags: ['Creator', 'Vibrant'],
    payload: {
      sections: makeSections('creator', ['header', 'socials', 'about']),
      previewTheme: 'dark',
    },
    source: 'builtin',
    authorName: 'BranReadme',
  },
]

const buildMeta = (count) => `${count} section${count === 1 ? '' : 's'}`

const hasMissingMarkdownColumnError = (error) => {
  const message = String(error?.message ?? '').toLowerCase()
  return message.includes('column') && message.includes('markdown') && message.includes('does not exist')
}

const normalizeTemplate = (row, source = 'remote') => {
  const payload = normalizeTemplatePayload({
    sections: row.sections,
    previewTheme: row.preview_theme,
  })
  return {
    id: String(row.id),
    name: String(row.name ?? 'Untitled Template'),
    description: String(row.description ?? 'Community template'),
    tags: sanitizeTags(row.tags),
    payload,
    markdown: String(row.markdown ?? ''),
    sectionCount: payload.sections.length,
    meta: buildMeta(payload.sections.length),
    createdAt: row.created_at ?? null,
    authorName: row.author_name ? String(row.author_name) : 'Community',
    isPublic: row.is_public !== false,
    source,
  }
}

const normalizeBuiltin = (template) => {
  const payload = normalizeTemplatePayload(template.payload)
  return {
    ...template,
    payload,
    tags: sanitizeTags(template.tags),
    sectionCount: payload.sections.length,
    meta: buildMeta(payload.sections.length),
    createdAt: null,
    isPublic: true,
  }
}

export const getBuiltinTemplates = () => BUILTIN_TEMPLATES.map(normalizeBuiltin)

export const fetchSharedTemplates = async () => {
  if (!hasSupabaseConfig || !supabase) return []

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(TEMPLATE_COLUMNS)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) {
    if (hasMissingMarkdownColumnError(error)) {
      throw new Error('Supabase schema is missing the markdown column. Update your templates table and retry.')
    }
    throw new Error(error.message || 'Unable to load templates from Supabase.')
  }

  return (data ?? []).map((row) => normalizeTemplate(row))
}

export const createSharedTemplate = async ({
  name,
  description,
  tags,
  payload,
  markdown,
  authorName,
  isPublic = true,
}) => {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  const safeName = String(name ?? '').trim()
  if (!safeName) {
    throw new Error('Template name is required.')
  }

  const normalizedPayload = normalizeTemplatePayload(payload)
  if (!normalizedPayload.sections.length) {
    throw new Error('No template sections found to save.')
  }

  const row = {
    name: safeName,
    description: String(description ?? '').trim() || null,
    tags: sanitizeTags(tags),
    sections: normalizedPayload.sections,
    markdown: String(markdown ?? '').trim() || null,
    preview_theme: normalizedPayload.previewTheme,
    author_name: String(authorName ?? '').trim() || null,
    is_public: Boolean(isPublic),
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(row)
    .select(TEMPLATE_COLUMNS)
    .single()

  if (error) {
    if (hasMissingMarkdownColumnError(error)) {
      throw new Error('Supabase schema is missing the markdown column. Update your templates table and retry.')
    }
    throw new Error(error.message || 'Unable to create template.')
  }

  return normalizeTemplate(data)
}

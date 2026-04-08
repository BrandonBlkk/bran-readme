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
  user_id,
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

const getRequiredId = (value, label, message = `${label} is required.`) => {
  const safeValue = String(value ?? '').trim()
  if (!safeValue) {
    throw new Error(message)
  }
  return safeValue
}

const hasMissingColumnError = (error, columnName) => {
  const message = String(error?.message ?? '').toLowerCase()
  return (
    message.includes('column')
    && message.includes(String(columnName ?? '').toLowerCase())
    && message.includes('does not exist')
  )
}

const createTemplateServiceError = (error, fallbackMessage) => {
  if (hasMissingColumnError(error, 'markdown')) {
    return new Error('Supabase schema is missing the markdown column. Update your templates table and retry.')
  }

  if (hasMissingColumnError(error, 'user_id')) {
    return new Error('Supabase schema is missing the user_id column. Apply the template ownership SQL and retry.')
  }

  return new Error(error?.message || fallbackMessage)
}

const buildTemplateDetails = ({
  name,
  description,
  tags,
  authorName,
}) => {
  const safeName = String(name ?? '').trim()
  if (!safeName) {
    throw new Error('Template name is required.')
  }

  return {
    name: safeName,
    description: String(description ?? '').trim() || null,
    tags: sanitizeTags(tags),
    author_name: String(authorName ?? '').trim() || null,
  }
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
    userId: row.user_id ? String(row.user_id) : null,
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
    throw createTemplateServiceError(error, 'Unable to load templates from Supabase.')
  }

  return (data ?? []).map((row) => normalizeTemplate(row))
}

export const fetchUserTemplates = async (userId) => {
  if (!hasSupabaseConfig || !supabase || !userId) return []

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(TEMPLATE_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw createTemplateServiceError(error, 'Unable to load your templates.')
  }

  return (data ?? []).map((row) => normalizeTemplate(row, 'owned'))
}

export const createSharedTemplate = async ({
  name,
  description,
  tags,
  payload,
  markdown,
  userId,
  authorName,
  isPublic = true,
}) => {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  const safeUserId = getRequiredId(userId, 'User', 'You must be signed in to create templates.')

  const normalizedPayload = normalizeTemplatePayload(payload)
  if (!normalizedPayload.sections.length) {
    throw new Error('No template sections found to save.')
  }

  const row = {
    ...buildTemplateDetails({
      name,
      description,
      tags,
      authorName,
    }),
    sections: normalizedPayload.sections,
    markdown: String(markdown ?? '').trim() || null,
    preview_theme: normalizedPayload.previewTheme,
    user_id: safeUserId,
    is_public: Boolean(isPublic),
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(row)
    .select(TEMPLATE_COLUMNS)
    .single()

  if (error) {
    throw createTemplateServiceError(error, 'Unable to create template.')
  }

  return normalizeTemplate(data)
}

export const updateSharedTemplate = async ({
  templateId,
  userId,
  name,
  description,
  tags,
  authorName,
  isPublic,
  markdown,
  payload,
}) => {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  const safeTemplateId = getRequiredId(templateId, 'Template id')
  const safeUserId = getRequiredId(userId, 'User', 'You must be signed in to update templates.')

  const row = buildTemplateDetails({
    name,
    description,
    tags,
    authorName,
  })

  if (typeof isPublic !== 'undefined') {
    row.is_public = Boolean(isPublic)
  }

  if (typeof markdown !== 'undefined') {
    row.markdown = String(markdown ?? '').trim() || null
  }

  if (typeof payload !== 'undefined') {
    const normalizedPayload = normalizeTemplatePayload(payload)
    if (!normalizedPayload.sections.length) {
      throw new Error('No template sections found to update.')
    }

    row.sections = normalizedPayload.sections
    row.preview_theme = normalizedPayload.previewTheme
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(row)
    .eq('id', safeTemplateId)
    .eq('user_id', safeUserId)
    .select(TEMPLATE_COLUMNS)
    .maybeSingle()

  if (error) {
    throw createTemplateServiceError(error, 'Unable to update template.')
  }

  if (!data) {
    throw new Error('Only the creator can update this template.')
  }

  return normalizeTemplate(data, 'owned')
}

export const deleteSharedTemplate = async ({
  templateId,
  userId,
}) => {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  const safeTemplateId = getRequiredId(templateId, 'Template id')
  const safeUserId = getRequiredId(userId, 'User', 'You must be signed in to delete templates.')

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', safeTemplateId)
    .eq('user_id', safeUserId)
    .select('id')
    .maybeSingle()

  if (error) {
    throw createTemplateServiceError(error, 'Unable to delete template.')
  }

  if (!data) {
    throw new Error('Only the creator can delete this template.')
  }
}

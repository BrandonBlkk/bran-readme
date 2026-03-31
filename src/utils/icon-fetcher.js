import { toast } from "sonner"

const CDN_URL =
  'https://cdn.jsdelivr.net/npm/simple-icons@latest/_data/simple-icons.json'
const GITHUB_URL =
  'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/_data/simple-icons.json'

const normalizeIcon = (icon) => ({
  name: icon.title ?? icon.name ?? icon.slug,
  slug: icon.slug,
  category: icon.category ?? icon.tags?.[0] ?? 'Other',
})

export const fetchExtraIcons = async ({
  source = 'cdn',
  limit,
} = {}) => {
  const urls = source === 'github' ? [GITHUB_URL, CDN_URL] : [CDN_URL, GITHUB_URL]

  for (const url of urls) {
    try {
      const response = await fetch(url)
      if (!response.ok) continue
      const payload = await response.json()
      const icons = Array.isArray(payload?.icons) ? payload.icons : payload
      if (!Array.isArray(icons)) continue
      const normalized = icons
        .filter((icon) => icon?.slug)
        .map(normalizeIcon)
      return typeof limit === 'number' ? normalized.slice(0, limit) : normalized
    } catch (e) {
      toast.error(e.message)
    }
  }

  return []
}
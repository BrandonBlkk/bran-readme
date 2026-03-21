import { Combobox } from '@headlessui/react'
import { Check, ChevronDown, RefreshCw, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import useStore from '../store/useStore'
import { techData } from '../utils/tech-data'
import { fetchExtraIcons } from '../utils/icon-fetcher'

const normalizeItem = (item) => ({
  name: item.name ?? item.title ?? item.slug,
  slug: item.slug,
  category: item.category ?? 'Other',
})

const TechStackCombobox = ({
  sectionId,
  sectionType = 'TECH_STACK',
  allowFetch = true,
}) => {
  const sections = useStore((s) => s.sections)
  const updateSectionData = useStore((s) => s.updateSectionData)
  const target = sectionId
    ? sections.find((section) => section.id === sectionId)
    : sections.find((section) => section.type === sectionType)

  const [query, setQuery] = useState('')
  const [options, setOptions] = useState(techData.map(normalizeItem))
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState('')

  const selected = useMemo(() => {
    const items = target?.data?.items ?? []
    return items.map((item) => {
      if (typeof item === 'string') {
        const found = options.find((option) => option.slug === item)
        return found ?? { name: item, slug: item, category: 'Other' }
      }
      return normalizeItem(item)
    })
  }, [options, target])

  const filteredOptions = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return options
    return options.filter((option) => {
      const haystack = `${option.name} ${option.slug} ${option.category}`.toLowerCase()
      return haystack.includes(trimmed)
    })
  }, [options, query])

  const MAX_VISIBLE = 20
  const visibleOptions = useMemo(
    () => filteredOptions.slice(0, MAX_VISIBLE),
    [filteredOptions],
  )

  const handleChange = (values) => {
    if (!target) return
    const normalized = values.map(normalizeItem)
    updateSectionData(target.id, { items: normalized })
  }

  const handleRemove = (slug) => {
    if (!target) return
    const next = selected.filter((item) => item.slug !== slug)
    updateSectionData(target.id, { items: next })
  }

  const handleFetch = async () => {
    setIsFetching(true)
    setError('')
    const next = await fetchExtraIcons({ source: 'cdn' })
    if (!next.length) {
      setError('Unable to fetch the latest icons right now.')
    } else {
      setOptions(next.map(normalizeItem))
    }
    setIsFetching(false)
  }

  if (!target) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        No Tech Stack section found. Add one to enable the combobox.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
            Tech Stack
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Search and select multiple tech icons.
          </p>
        </div>
        {allowFetch && (
          <button
            type="button"
            onClick={handleFetch}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-600 shadow-sm transition hover:border-zinc-300 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            disabled={isFetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Sync Icons
          </button>
        )}
      </div>

      <Combobox value={selected} onChange={handleChange} multiple by="slug">
        <div className="relative">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm focus-within:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">
            <Search className="h-4 w-4 text-zinc-400" />
            <Combobox.Input
              className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
              placeholder="Search tech..."
              onChange={(event) => setQuery(event.target.value)}
              displayValue={() => query}
            />
            <Combobox.Button className="rounded-full p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
              <ChevronDown className="h-4 w-4" />
            </Combobox.Button>
          </div>

          <Combobox.Options className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            {filteredOptions.length === 0 && (
              <div className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                No results found.
              </div>
            )}
            {visibleOptions.map((option) => (
              <Combobox.Option
                key={option.slug}
                value={option}
                className={({ active }) =>
                  `flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm ${
                    active
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800/70 dark:text-zinc-100'
                      : 'text-zinc-700 dark:text-zinc-300'
                  }`
                }
              >
                {({ selected: isSelected }) => (
                  <>
                    <div>
                      <p className="font-medium">{option.name}</p>
                      <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-400">
                        {option.category}
                      </p>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-emerald-500" />}
                  </>
                )}
              </Combobox.Option>
            ))}
            {filteredOptions.length > MAX_VISIBLE && (
              <div className="px-3 py-2 text-xs text-zinc-400">
                Showing {MAX_VISIBLE} of {filteredOptions.length}. Refine your search to narrow
                results.
              </div>
            )}
          </Combobox.Options>
        </div>
      </Combobox>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <span
              key={item.slug}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              {item.name}
              <button
                type="button"
                onClick={() => handleRemove(item.slug)}
                className="rounded-full p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label={`Remove ${item.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default TechStackCombobox

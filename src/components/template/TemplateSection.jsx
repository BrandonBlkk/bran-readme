import { createElement } from 'react'
import { LayoutGrid } from 'lucide-react'
import { generateMarkdown } from '../../utils/markdown'
import TemplateCard from './TemplateCard'
import TemplateSkeleton from './TemplateSkeleton'

const EMPTY_FAVORITES = new Set()

const getPreviewMarkdown = (template) =>
  template.markdown || generateMarkdown(template.payload?.sections || [])

const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/60 px-5 py-24 text-center">
    <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
    {description && (
      <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-zinc-500 sm:text-sm">
        {description}
      </p>
    )}
    {actionLabel && typeof onAction === 'function' && (
      <button
        type="button"
        onClick={onAction}
        className="mt-5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-zinc-950 transition-opacity hover:opacity-90 cursor-pointer"
      >
        {actionLabel}
      </button>
    )}
  </div>
)

const TemplateSection = ({
  id,
  title,
  description = '',
  icon = LayoutGrid,
  iconClassName = 'text-blue-400',
  templates = [],
  isLoading = false,
  skeletonCount = 3,
  highlightedTemplateId = null,
  favoriteIds = EMPTY_FAVORITES,
  onUseTemplate,
  onToggleFavorite,
  onPreviewTemplate,
  emptyStateTitle = 'Nothing here yet',
  emptyStateDescription = '',
  emptyActionLabel = '',
  onEmptyAction,
}) => {
  const hasTemplates = templates.length > 0
  const IconComponent = icon || LayoutGrid

  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 lg:p-7"
    >
      <div className="mb-6 flex items-start gap-3">
        {createElement(IconComponent, {
          size: 18,
          className: `mt-0.5 shrink-0 ${iconClassName}`,
        })}
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 sm:text-base">{title}</h2>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 sm:text-sm">
              {description}
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <TemplateSkeleton key={`${id}-skeleton-${index + 1}`} />
          ))}
        </div>
      ) : hasTemplates ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard
              key={`${id}-${template.id}`}
              template={template}
              isFavorite={favoriteIds.has(template.id)}
              isHighlighted={highlightedTemplateId === template.id}
              previewMarkdown={getPreviewMarkdown(template)}
              onUseTemplate={onUseTemplate}
              onToggleFavorite={onToggleFavorite}
              onPreviewTemplate={onPreviewTemplate}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={emptyStateTitle}
          description={emptyStateDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      )}
    </section>
  )
}

export default TemplateSection

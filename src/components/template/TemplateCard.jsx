import React from 'react'
import { Heart, Eye, Sparkles } from 'lucide-react'
import TemplateMockup from './TemplateMockup'

const TemplateCard = ({ 
    template, 
    isFavorite, 
    isHighlighted, 
    previewMarkdown, 
    onUseTemplate, 
    onToggleFavorite,
    setPreviewTemplate
}) => {
    const pillBase = 'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]'

    return (
        <article
            className={`group relative flex flex-col rounded-2xl border bg-zinc-950 p-5 transition-all ${
            isHighlighted
                ? 'border-blue-500/70 shadow-[0_0_0_1px_rgba(59,130,246,0.4)]'
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
        >
            <TemplateMockup
                markdown={previewMarkdown}
                onClick={() => setPreviewTemplate({ ...template, previewMarkdown })}
            />

            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-zinc-50">{template.name}</h3>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500 line-clamp-2">
                        {template.description || 'No description'}
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        {template.authorName} | {template.meta}
                    </p>
                </div>
                <button
                    onClick={() => onToggleFavorite(template.id)}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all cursor-pointer ${
                    isFavorite
                        ? 'border-rose-500/40 bg-rose-400/10 text-rose-500'
                        : 'border-zinc-800 text-zinc-600 hover:text-zinc-300'
                    }`}
                >
                    <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 select-none">
                {template.tags?.map((tag) => (
                    <span key={tag} className={`${pillBase} border-zinc-800 bg-zinc-900 text-zinc-500`}>
                        {tag}
                    </span>
                ))}
                {!template.tags?.length && (
                    <span className={`${pillBase} border-zinc-800 bg-zinc-900 text-zinc-600`}>
                        No tags
                    </span>
                )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                    onClick={() => setPreviewTemplate({ ...template, previewMarkdown })}
                    className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-bold text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-200 active:scale-95 select-none cursor-pointer"
                >
                    <Eye size={14} />
                    Preview
                </button>
                <button
                    onClick={() => onUseTemplate(template)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-zinc-50 py-2.5 text-xs font-bold text-zinc-950 transition-all hover:bg-zinc-200 active:scale-95 select-none cursor-pointer"
                >
                    <Sparkles size={14} />
                    Use Template
                </button>
            </div>
        </article>
    )
}

export default TemplateCard
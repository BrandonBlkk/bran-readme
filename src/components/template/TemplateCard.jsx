import { useEffect, useRef, useState } from 'react'
import { Heart, Eye, Sparkles, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import TemplateMockup from './TemplateMockup'

const TemplateCard = ({ 
    template, 
    isFavorite, 
    isHighlighted, 
    previewMarkdown, 
    onUseTemplate, 
    onToggleFavorite,
    onPreviewTemplate,
    onEditTemplate,
    onDeleteTemplate,
    canManage = false,
    isDeleting = false,
}) => {
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef(null)
    const pillBase = 'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]'
    
    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleOpenPreview = () => {
        if (typeof onPreviewTemplate !== 'function') return
        onPreviewTemplate({ ...template, previewMarkdown })
    }

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
                onClick={handleOpenPreview}
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
                <div className='flex items-center gap-2'>
                    <button
                        type="button"
                        onClick={() => onToggleFavorite(template.id)}
                        disabled={isDeleting}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all cursor-pointer ${
                        isFavorite
                            ? 'border-rose-500/40 bg-rose-400/10 text-rose-500'
                            : 'border-zinc-800 text-zinc-600 hover:text-zinc-300'
                        } ${isDeleting ? 'cursor-not-allowed opacity-60' : ''}`}
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>

                    {canManage && (
                        <div ref={menuRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setShowMenu((prev) => !prev)}
                                disabled={isDeleting}
                                className={`flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-500 transition-colors ${
                                    isDeleting
                                        ? 'cursor-not-allowed opacity-60'
                                        : 'hover:bg-zinc-900 hover:text-zinc-200 cursor-pointer'
                                }`}
                                aria-label="Manage template"
                            >
                                <MoreVertical size={14} />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 top-full z-10 mt-2 w-32 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (typeof onEditTemplate === 'function') {
                                                onEditTemplate(template)
                                            }
                                            setShowMenu(false)
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-zinc-800 cursor-pointer"
                                    >
                                        <Pencil size={12} />
                                        Update
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (typeof onDeleteTemplate === 'function') {
                                                onDeleteTemplate(template)
                                            }
                                            setShowMenu(false)
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-[11px] font-medium text-rose-400 transition-colors hover:bg-rose-500/10 cursor-pointer"
                                    >
                                        <Trash2 size={12} />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
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

            <div className="mt-6 grid grid-cols-2 gap-2 select-none">
                <button
                    type="button"
                    onClick={handleOpenPreview}
                    className="flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-bold text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-200 active:scale-95 select-none cursor-pointer"
                >
                    <Eye size={14} />
                    Preview
                </button>
                <button
                    type="button"
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

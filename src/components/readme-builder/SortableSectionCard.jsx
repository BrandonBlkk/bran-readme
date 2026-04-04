import React, { useEffect, useState } from 'react'
import { useSortable, defaultAnimateLayoutChanges } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, GripVertical } from 'lucide-react'

const SortableSectionCard = ({
  id,
  title,
  description,
  pillLabel,
  pillClass,
  containerRef,
  highlightSignal = 0,
  isHighlighted = false,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(true)
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    animateLayoutChanges: defaultAnimateLayoutChanges,
    transition: { duration: 200, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
  })

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  }

  useEffect(() => {
    if (!highlightSignal) return

    const timeoutId = setTimeout(() => {
      setIsOpen(true)
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [highlightSignal])

  const handleContainerRef = (node) => {
    setNodeRef(node)

    if (typeof containerRef === 'function') {
      containerRef(node)
    }
  }

  return (
    <div
      ref={handleContainerRef}
      style={dndStyle}
      className={`rounded-xl border bg-zinc-900 p-4 transition-all duration-150 hover:border-zinc-700 ${
        isDragging
          ? 'z-50 border-blue-500 opacity-40 shadow-[0_0_24px_rgba(59,130,246,0.08)]'
          : isHighlighted
            ? 'border-blue-500/70 shadow-[0_0_0_1px_rgba(59,130,246,0.18)]'
            : 'border-zinc-800'
      }`}
    >
      {/* Card Header */}
      <div
        className="flex cursor-pointer select-none items-center justify-between gap-3"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen((prev) => !prev)
          }
        }}
      >
        <div className="flex items-center gap-2.5">
          <button
            ref={setActivatorNodeRef}
            type="button"
            {...listeners}
            {...attributes}
            onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
            className={`flex h-7 w-7 touch-none items-center justify-center rounded-md border border-zinc-800 bg-zinc-950 text-zinc-500 transition-all duration-150 ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            aria-label="Drag to reorder"
          >
            <GripVertical size={14} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[13px] font-semibold text-zinc-50"
              >
                {title}
              </span>
              <span className={pillClass}>
                {pillLabel}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-zinc-600">
              {description}
            </p>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-zinc-500"
        >
          <ChevronDown size={16} />
        </motion.div>
      </div>

      {/* Card Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SortableSectionCard

import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Sparkles } from 'lucide-react'

const EmptyState = ({ onQuickStart }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900 px-6 py-12 text-center"
  >
    <div
      className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/15"
    >
      <FileText size={24} className="text-blue-500" />
    </div>
    <h3 className="mb-1.5 text-base font-semibold text-zinc-50">
      Your README is empty
    </h3>
    <p className="mb-5 max-w-70 text-[13px] text-zinc-500">
      Add sections from the panel above, or load a full template with one click.
    </p>
    <button
      type="button"
      onClick={onQuickStart}
      className="flex items-center gap-1.5 rounded-lg border border-blue-500 bg-blue-500 px-4 py-2 text-[13px] font-semibold text-white transition-all duration-150 hover:border-blue-400 hover:bg-blue-400"
    >
      <Sparkles size={14} />
      Quick Start
    </button>
  </motion.div>
)

export default EmptyState

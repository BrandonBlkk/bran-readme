import React from 'react'
import { GripVertical } from 'lucide-react'

const DragPreview = ({ title, pillLabel, pillClass }) => (
  <div
    className="rotate-2 rounded-lg border border-blue-500 bg-zinc-900 px-3.5 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.6)] opacity-[0.92]"
  >
    <div className="flex items-center gap-2">
      <GripVertical size={14} className="text-zinc-500" />
      <span className="text-[13px] font-semibold text-zinc-50">
        {title}
      </span>
      <span className={pillClass}>
        {pillLabel}
      </span>
    </div>
  </div>
)

export default DragPreview

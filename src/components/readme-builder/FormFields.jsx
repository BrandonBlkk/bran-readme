import React from 'react'

export const labelClass =
  'text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500'
export const inputClass =
  'w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-[13px] font-mono text-zinc-50 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15'

export const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className={`mb-1.5 block ${labelClass}`}>{label}</span>
    {children}
    {hint && (
      <span className="mt-1 block text-[11px] text-zinc-600">
        {hint}
      </span>
    )}
  </label>
)

export const RangeField = ({ label, min, max, step = 1, value, onChange }) => (
  <label className="block">
    <span className={`mb-1.5 block ${labelClass}`}>{label}</span>
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-blue-500"
      />
      <span className="min-w-7 text-right text-xs font-mono text-zinc-400">
        {value}
      </span>
    </div>
  </label>
)

export const ColorField = ({ label, value, onChange }) => (
  <label className="block">
    <span className={`mb-1.5 block ${labelClass}`}>{label}</span>
    <div
      className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5"
    >
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 cursor-pointer rounded border border-zinc-800 bg-transparent p-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-xs font-mono text-zinc-50 outline-none"
      />
    </div>
  </label>
)

import React from 'react'

const Toggle = ({ label, title, description, checked, onChange }) => {
  const isDetailed = Boolean(description) || Boolean(title)
  const displayTitle = title ?? label ?? ''
  const containerClass = isDetailed
    ? 'flex w-full items-start gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-left transition-all duration-150 hover:border-zinc-700 cursor-pointer'
    : 'flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-[13px] text-zinc-50 transition-colors duration-150 cursor-pointer'
  const switchClass = isDetailed
    ? `relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-blue-500' : 'bg-zinc-800'
      }`
    : `relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-blue-500' : 'bg-zinc-800'
      }`
  const thumbClass = isDetailed
    ? `h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
        checked ? 'translate-x-4.5' : 'translate-x-0.5'
      }`
    : `h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
        checked ? 'translate-x-4.5' : 'translate-x-0.5'
      }`

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={containerClass}
      aria-pressed={checked}
    >
      {isDetailed ? (
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-50">{displayTitle}</p>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              {description}
            </p>
          ) : null}
        </div>
      ) : (
        <span>{displayTitle}</span>
      )}
      <span className={switchClass}>
        <span className={thumbClass} />
      </span>
    </button>
  )
}

export default Toggle

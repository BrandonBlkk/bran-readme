import React from 'react'

const Toggle = ({ label, title, description, checked, onChange }) => {
  const isDetailed = Boolean(description) || Boolean(title)
  const displayTitle = title ?? label ?? ''
  const containerClass = isDetailed
    ? 'flex w-full items-start justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-left transition-all duration-150 hover:border-zinc-700 cursor-pointer'
    : 'flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-[13px] text-zinc-50 transition-colors duration-150 cursor-pointer'

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={containerClass}
    >
      {isDetailed ? (
        <div>
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
      <span
        className={`relative ${isDetailed ? 'mt-1 ' : ''}inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
          checked ? 'bg-blue-500' : 'bg-zinc-800'
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
            checked ? 'translate-x-4.5' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}

export default Toggle

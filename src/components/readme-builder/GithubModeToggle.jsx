import React from 'react'
import { Moon, Sun } from 'lucide-react'

const GithubModeToggle = ({ previewTheme, onChange }) => (
  <div
    className="flex items-center gap-0.5 rounded-lg border border-zinc-800 bg-zinc-950 p-0.75 select-none"
  >
    <button
      type="button"
      onClick={() => onChange('dark')}
      className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all duration-150 cursor-pointer ${
        previewTheme === 'dark'
          ? 'border-zinc-800 bg-zinc-900 text-zinc-50'
          : 'border-transparent text-zinc-500'
      }`}
    >
      <Moon size={12} />
      Dark
    </button>
    <button
      type="button"
      onClick={() => onChange('light')}
      className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all duration-150 cursor-pointer ${
        previewTheme === 'light'
          ? 'border-zinc-800 bg-zinc-900 text-zinc-50'
          : 'border-transparent text-zinc-500'
      }`}
    >
      <Sun size={12} />
      Light
    </button>
  </div>
)

export default GithubModeToggle

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'

const baseClass =
  'flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-xs font-medium text-zinc-400 transition-all duration-150 hover:border-zinc-700 hover:text-zinc-50 cursor-pointer select-none'

const ResetButton = ({ label = 'Reset', onClick, className = '', iconSize = 13 }) => {
  const [isRotating, setIsRotating] = useState(false)

  const handleClick = () => {
    setIsRotating(true)
    if (onClick) onClick()
    setTimeout(() => setIsRotating(false), 500)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${baseClass} ${className}`.trim()}
    >
      <RotateCcw
        size={iconSize}
        className={isRotating ? '-rotate-360 transition-all duration-300 ease-in-out' : ''}
      />
      {label}
    </button>
  )
}

export default ResetButton

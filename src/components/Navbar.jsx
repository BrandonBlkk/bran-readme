import { Copy, RotateCcw } from 'lucide-react'

const Navbar = ({ onReset, onCopy }) => {
  return (
    <header
      className="glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        borderRadius: 0,
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h1
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          ReadmeForge
        </h1>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--text-faint)',
            padding: '2px 8px',
            borderRadius: '9999px',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-surface)',
          }}
        >
          v1.0
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={onReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 500,
            fontFamily: 'var(--font-sans)',
            color: 'var(--text-secondary)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-muted)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          <RotateCcw size={13} />
          Reset
        </button>

        <button
          type="button"
          onClick={onCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 500,
            fontFamily: 'var(--font-sans)',
            color: '#fff',
            background: 'var(--accent)',
            border: '1px solid var(--accent)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-hover)'
            e.currentTarget.style.borderColor = 'var(--accent-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--accent)'
            e.currentTarget.style.borderColor = 'var(--accent)'
          }}
        >
          <Copy size={13} />
          Copy Markdown
        </button>
      </div>
    </header>
  )
}

export default Navbar

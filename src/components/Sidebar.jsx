import { useState } from 'react'
import { LayoutGrid, FileText, Settings, Download, Plus } from 'lucide-react'

const sidebarItems = [
  { id: 'add', icon: Plus, label: 'Add Section', action: 'add' },
  { id: 'templates', icon: LayoutGrid, label: 'Templates', action: 'templates' },
  { id: 'settings', icon: Settings, label: 'Settings', action: 'settings' },
  { id: 'export', icon: Download, label: 'Export', action: 'export' },
]

const Sidebar = ({ activePanel, onPanelChange }) => {
  return (
    <aside
      style={{
        width: '48px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '16px',
        gap: '4px',
        background: 'rgba(24, 24, 27, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border-default)',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--accent-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          border: '1px solid rgba(59,130,246,0.2)',
        }}
      >
        <FileText size={16} style={{ color: 'var(--accent)' }} />
      </div>

      {sidebarItems.map((item) => {
        const Icon = item.icon
        const isActive = activePanel === item.action
        return (
          <button
            key={item.id}
            onClick={() => onPanelChange(item.action)}
            title={item.label}
            aria-label={item.label}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              background: isActive ? 'var(--accent-muted)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'var(--bg-elevated)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--text-muted)'
              }
            }}
          >
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  left: '-6px',
                  width: '3px',
                  height: '16px',
                  borderRadius: '0 2px 2px 0',
                  background: 'var(--accent)',
                }}
              />
            )}
            <Icon size={18} />
          </button>
        )
      })}
    </aside>
  )
}

export default Sidebar

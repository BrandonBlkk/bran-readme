import profileImage from '../assets/images/Profile.png';

export default function Footer() {
  return (
    <footer
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '20px 0',
        borderTop: '1px solid var(--border-default)',
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginTop: 'auto',
      }}
    >
      Made by
      <a
        href="https://github.com/BrandonBlkk"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-primary)',
          textDecoration: 'none',
          transition: 'color 200ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
      >
        <img
          src={profileImage}
          alt="Profile"
          style={{ width: '20px', height: '20px', borderRadius: '50%' }}
        />
        Brandon
      </a>
    </footer>
  )
}
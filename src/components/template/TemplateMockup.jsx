import Preview from '../readme-builder/Preview'

const FALLBACK_MARKDOWN = `
# README Preview

This template does not have preview content yet.

- Header
- Stats
- Tech Stack
- Social Links
`

const resolvePreviewMarkdown = (value) => {
  const text = String(value ?? '').trim()
  if (!text) return FALLBACK_MARKDOWN
  return text
}

const TemplateMockup = ({ markdown = '', onClick }) => {
  const previewMarkdown = resolvePreviewMarkdown(markdown)
  const isInteractive = typeof onClick === 'function'

  return (
    <div
      className={`mb-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-inner ${isInteractive ? 'cursor-pointer hover:border-zinc-700' : ''}`}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={isInteractive ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      } : undefined}
    >
      <div className="relative h-52 overflow-hidden p-3">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-7 bg-linear-to-b from-zinc-950 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-linear-to-t from-zinc-950 to-transparent" />

        <div className="pointer-events-none origin-top-left scale-[0.44] sm:scale-[0.5] w-[228%] sm:w-[200%] min-h-[228%] sm:min-h-[200%] select-none">
          <Preview
            markdown={previewMarkdown}
            previewTheme="dark"
          />
        </div>
      </div>
    </div>
  )
}

export default TemplateMockup

import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

const Preview = ({ markdown, previewTheme }) => {
  const isDark = previewTheme === 'dark'
  const theme = {
    container: isDark
      ? 'border-[#30363d] bg-[#0d1117] text-[#e6edf3]'
      : 'border-[#d0d7de] bg-white text-[#1f2328]',
    muted: isDark ? 'text-[#7d8590]' : 'text-[#656d76]',
    link: isDark ? 'text-[#58a6ff]' : 'text-[#0969da]',
    codeBg: isDark ? 'bg-[#161b22]' : 'bg-[#f6f8fa]',
    blockquote: isDark ? 'border-[#30363d] text-[#7d8590]' : 'border-[#d0d7de] text-[#656d76]',
  }

  const components = {
    h1: (props) => {
      const showDivider = props['data-divider'] !== 'false'
      const dividerClass = showDivider ? `border-b pb-[0.3em] ${isDark ? 'border-[#30363d]' : 'border-[#d0d7de]'}` : ''
      return (
        <h1
          className={`mb-4 text-[26px] font-semibold sm:text-[28px] md:text-[32px] ${dividerClass}`}
          {...props}
        />
      )
    },
    h2: (props) => {
      const showDivider = props['data-divider'] !== 'false'
      const dividerClass = showDivider ? `border-b pb-[0.3em] ${isDark ? 'border-[#30363d]' : 'border-[#d0d7de]'}` : ''
      return (
        <h2
          className={`mb-4 mt-6 text-[20px] font-semibold sm:text-[22px] md:text-[24px] ${dividerClass}`}
          {...props}
        />
      )
    },
    h3: (props) => (
      <h3 className="mb-4 mt-6 text-[18px] font-semibold sm:text-[19px] md:text-[20px]" {...props} />
    ),
    h4: (props) => (
      <h4 className="mb-3 mt-5 text-[16px] font-semibold sm:text-[17px] md:text-[18px]" {...props} />
    ),
    h5: (props) => (
      <h5 className="mb-3 mt-5 text-[15px] font-semibold sm:text-[16px]" {...props} />
    ),
    h6: (props) => (
      <h6 className="mb-3 mt-5 text-[14px] font-semibold uppercase tracking-[0.04em]" {...props} />
    ),
    p: (props) => {
      const children = React.Children.toArray(props.children)
      const isOnlyImages = children.length > 0 && children.every((child) => {
        if (typeof child === 'string') return child.trim() === ''
        if (!React.isValidElement(child)) return false
        const src = child.props?.src
        return (
          typeof src === 'string'
          && (
            src.includes('cdn.simpleicons.org')
            || src.includes('skillicons.dev')
            || src.includes('github-readme-stats-delta-eight-12.vercel.app')
            || src.includes('github-profile-trophy.screw-hand.vercel.app')
            || src.includes('github-profile-trophy-alpha-ecru.vercel.app')
            || src.includes('github-profile-trophy.vercel.app')
          )
        )
      })
      return (
        <p className={`mb-4 leading-normal ${isOnlyImages ? 'select-none' : ''}`} {...props} />
      )
    },
    ul: (props) => (
      <ul className="m-0 p-0" {...props} />
    ),
    ol: (props) => (
      <ol className="m-0 p-0" {...props} />
    ),
    a: (props) => (
      <a className={`${theme.link} hover:underline`} {...props} />
    ),
    li: (props) => (
      <li className="mb-1 ml-6 list-disc" {...props} />
    ),
    code: ({ inline, ...props }) => (
      inline ? (
        <code className={`rounded-md ${theme.codeBg} px-[0.4em] py-[0.2em] text-[85%] font-mono`} {...props} />
      ) : (
        <code className="bg-transparent p-0 text-[100%] font-mono" {...props} />
      )
    ),
    pre: (props) => (
      <pre className={`mb-4 overflow-auto rounded-md ${theme.codeBg} p-4 text-[85%] leading-[1.45]`} {...props} />
    ),
    blockquote: (props) => (
      <blockquote className={`my-0 border-l-4 px-4 ${theme.blockquote}`} {...props} />
    ),
    img: ({ src = '', alt = '', ...props }) => {
      const isTechIcon = typeof src === 'string'
        && (src.includes('cdn.simpleicons.org') || src.includes('skillicons.dev'))
      const isGitStats = typeof src === 'string'
        && (
          src.includes('github-readme-stats-delta-eight-12.vercel.app')
          || src.includes('github-profile-trophy.screw-hand.vercel.app')
          || src.includes('github-profile-trophy-alpha-ecru.vercel.app')
          || src.includes('github-profile-trophy.vercel.app')
        )
      const selectNone = (isTechIcon || isGitStats) ? 'select-none' : ''
      const className = isTechIcon
        ? 'inline-block align-middle h-auto w-[clamp(24px,5vw,40px)] max-w-none'
        : isGitStats
          ? 'inline-block align-middle h-auto max-w-full'
          : 'max-w-full h-auto'
      return <img src={src} alt={alt} className={`${className} ${selectNone}`} {...props} />
    },
  }

  return (
    <div
      className={`w-full max-w-220 rounded-xl border ${theme.container} shadow-[0_4px_12px_rgba(0,0,0,0.5)]`}
    >
      <div className="px-4 py-5 sm:px-6 md:px-10 md:py-8">
        <div className="wrap-break-word text-sm leading-normal sm:text-base font-['-apple-system', BlinkMacSystemFont,'Segoe_UI','Noto_Sans',Helvetica,Arial,sans-serif]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={components}
          >
            {markdown}
          </ReactMarkdown>
          {!markdown && (
            <p className={`text-sm ${theme.muted}`}>
              Start adding sections to see the preview.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Preview

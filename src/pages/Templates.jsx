import React, { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { LayoutGrid, Sparkles, Share2, Plus, Heart } from 'lucide-react'
import TemplateMockup from '../components/TemplateMockup'
import Footer from '../components/Footer'

const TEMPLATE_LIBRARY = [
  {
    id: 'starter',
    name: 'Starter Profile',
    description: 'A clean, balanced layout that works for most developer profiles.',
    tags: ['Balanced', 'Popular'],
    sections: ['Header', 'Stats', 'Skills', 'Socials', 'About'],
    meta: '5 sections',
  },
  {
    id: 'minimal',
    name: 'Minimal Stack',
    description: 'Focused on essentials with a simple skills strip and short bio.',
    tags: ['Minimal', 'Fast'],
    sections: ['Header', 'Skills', 'About'],
    meta: '3 sections',
  },
  {
    id: 'showcase',
    name: 'Showcase',
    description: 'Highlights projects, metrics, and credibility with bold cards.',
    tags: ['Portfolio', 'Bold'],
    sections: ['Header', 'Stats', 'Projects', 'Socials', 'About'],
    meta: '5 sections',
  },
  {
    id: 'community',
    name: 'Community Builder',
    description: 'Optimized for open-source maintainers and community reach.',
    tags: ['Open Source', 'Community'],
    sections: ['Header', 'Socials', 'Highlights', 'About'],
    meta: '4 sections',
  },
  {
    id: 'recruiter',
    name: 'Recruiter Friendly',
    description: 'Emphasizes role, impact, and tech stack for hiring managers.',
    tags: ['Career', 'Clean'],
    sections: ['Header', 'Stats', 'Skills', 'About'],
    meta: '4 sections',
  },
  {
    id: 'creator',
    name: 'Creator Mode',
    description: 'Perfect for creators who want links, media, and socials upfront.',
    tags: ['Creator', 'Vibrant'],
    sections: ['Header', 'Socials', 'Media', 'About'],
    meta: '4 sections',
  },
]

const pillBase = 'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]'

const Templates = () => {
  const currentYear = 2026
  const [favorites, setFavorites] = useState(() => new Set(['starter', 'showcase']))
  const favoriteCount = useMemo(() => favorites.size, [favorites])

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 font-sans text-zinc-50 antialiased selection:bg-blue-500 selection:text-white">
      <Sidebar activePanel="templates" onPanelChange={() => {}} />

      <div className="ml-0 lg:ml-12 flex h-screen min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="w-full px-4 py-5">
          <div className="space-y-3">
            <header className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] lg:p-8">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 select-none">
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-blue-400">Templates</span>
                <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-zinc-400">Library {currentYear}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-zinc-50 sm:text-3xl">Prebuilt README Templates</h1>
                  <p className="mt-3 max-w-2xl text-xs leading-relaxed text-zinc-400 sm:text-sm">
                    Pick a GitHub profile README layout, save your favorites, or start your own template.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-all cursor-pointer"><Plus size={14} /> Create Template</button>
                  <button className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-900 transition-all select-none cursor-pointer"><Share2 size={14} className="text-blue-400" /> Share</button>
                </div>
              </div>
            </header>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 lg:p-7">
              <div className="mb-6 flex items-center gap-3">
                <LayoutGrid size={18} className="text-blue-400" />
                <h2 className="text-sm font-semibold sm:text-base text-zinc-100">Featured Templates</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {TEMPLATE_LIBRARY.map((template) => {
                  const isFavorite = favorites.has(template.id)
                  return (
                    <article key={template.id} className="group relative flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition-all hover:border-zinc-700">
                      
                      {/* --- VISUAL PREVIEW ADDED HERE --- */}
                      <TemplateMockup />

                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-zinc-50">{template.name}</h3>
                          <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500 line-clamp-2">{template.description}</p>
                        </div>
                        <button onClick={() => toggleFavorite(template.id)} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all cursor-pointer ${isFavorite ? 'border-rose-500/40 bg-rose-400/10 text-rose-500' : 'border-zinc-800 text-zinc-600 hover:text-zinc-300'}`}>
                          <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 select-none">
                        {template.tags.map((tag) => (
                          <span key={tag} className={`${pillBase} border-zinc-800 bg-zinc-900 text-zinc-500`}>{tag}</span>
                        ))}
                      </div>

                      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-50 py-2.5 text-xs font-bold text-zinc-950 transition-all hover:bg-zinc-200 active:scale-95 select-none cursor-pointer">
                        <Sparkles size={14} />
                        Use Template
                      </button>
                    </article>
                  )
                })}
              </div>
            </section>

            <Footer label="README Templates Gallery" />  
          </div>
        </div>
      </div>
    </div>
  )
}

export default Templates
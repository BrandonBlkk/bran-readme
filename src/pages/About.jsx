import React from 'react'
import Sidebar from '../components/Sidebar'
import { Info, Layout, Zap, Shield, Github, ExternalLink } from 'lucide-react'

const About = () => {
  const currentYear = 2026;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 font-sans text-zinc-50 antialiased selection:bg-blue-500 selection:text-white">
      <Sidebar activePanel="about" onPanelChange={() => {}} />

      <div className="ml-12 flex h-screen min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-10 py-5">
          <div className="space-y-3">
            <header className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 select-none">
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-blue-400">
                  About
                </span>
                <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-zinc-400">
                  Generator {currentYear}
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-zinc-50">
                About BranReadme
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
                BranReadme helps developers craft professional GitHub README files fast — with a
                drag-and-drop builder, real-time preview, and export-ready markdown.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 select-none">
                <a
                  href="https://github.com/BrandonBlkk/bran-readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-blue-500 bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-blue-600"
                >
                  <Github size={14} />
                  <span>Project GitHub</span>
                  <ExternalLink size={12} />
                </a>
                <a
                  href="https://github.com/BrandonBlkk/bran-readme/stargazers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-semibold text-zinc-200 transition-all hover:border-zinc-700 hover:bg-[#1e1e22]"
                >
                  <Zap size={14} className="text-blue-400" />
                  <span>Star the Project</span>
                </a>
              </div>
            </header>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-7">
              <h2 className="mb-5 flex items-center gap-3 text-base font-semibold">
                <Info size={18} className="text-blue-400" />
                What You Can Do
              </h2>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Layout size={16} className="text-blue-400" />
                    <h3 className="text-sm font-semibold">Drag & Drop Builder</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-400">
                    Arrange sections exactly how you want with simple drag-and-drop controls.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Zap size={16} className="text-blue-400" />
                    <h3 className="text-sm font-semibold">Live Preview</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-400">
                    See the README preview update instantly as you edit content and settings.
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 md:col-span-2">
                  <div className="mb-2 flex items-center gap-2">
                    <Shield size={16} className="text-blue-400" />
                    <h3 className="text-sm font-semibold">Templates & Sharing</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-400">
                    Build your own templates and share them with other users so the community can
                    reuse and remix great README layouts.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-7">
              <h2 className="mb-3 text-base font-semibold text-zinc-50">Mission</h2>
              <p className="text-xs leading-relaxed text-zinc-400">
                In {currentYear}, we want every project to ship with clear documentation. BranReadme removes the
                busywork so you can focus on building great software — and share templates that
                help others do the same.
              </p>
            </section>

            {/* Added Footer Section for the Year */}
            <footer className="py-6 text-center">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                © {currentYear} BranReadme • Built for the Open Source Community
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
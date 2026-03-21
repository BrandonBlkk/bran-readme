import React from 'react'
import Sidebar from '../components/Sidebar'
import { Info, Layout, Zap, Shield, Github, ExternalLink } from 'lucide-react'

const About = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 font-sans text-zinc-50 antialiased selection:bg-blue-500 selection:text-white">
      <Sidebar activePanel="about" onPanelChange={() => {}} />
      
      <div className="ml-12 flex h-screen min-h-0 flex-1 flex-col overflow-y-auto p-10">
        <div className="mx-auto w-full max-w-3xl">
          <header className="mb-12">
            <h1 className="mb-4 text-4xl font-bold text-blue-500">About ReadmeForge</h1>
            <p className="text-lg leading-relaxed text-zinc-400">
              ReadmeForge is a powerful, intuitive tool designed to help developers create professional GitHub READMEs in minutes.
            </p>
          </header>

          <section className="mb-8 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-8 backdrop-blur-md">
            <h2 className="mb-6 flex items-center gap-3 text-xl font-semibold">
              <Info size={24} className="text-blue-500" />
              Key Features
            </h2>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-800/50 bg-zinc-800/30 p-5">
                <div className="mb-3 flex items-center gap-3">
                  <Layout size={20} className="text-blue-500" />
                  <h3 className="font-semibold">Drag & Drop Builder</h3>
                </div>
                <p className="text-sm leading-relaxed text-zinc-400">
                  Easily arrange and customize sections of your README with our intuitive drag-and-drop interface.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800/50 bg-zinc-800/30 p-5">
                <div className="mb-3 flex items-center gap-3">
                  <Zap size={20} className="text-blue-500" />
                  <h3 className="font-semibold">Real-time Preview</h3>
                </div>
                <p className="text-sm leading-relaxed text-zinc-400">
                  See your changes instantly with our live markdown preview that matches GitHub's styling.
                </p>
              </div>

              <div className="rounded-xl border border-zinc-800/50 bg-zinc-800/30 p-5">
                <div className="mb-3 flex items-center gap-3">
                  <Shield size={20} className="text-blue-500" />
                  <h3 className="font-semibold">Ready-to-use Templates</h3>
                </div>
                <p className="text-sm leading-relaxed text-zinc-400">
                  Start quickly with professionally designed templates for various types of projects.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-8 backdrop-blur-md">
            <h2 className="mb-4 text-xl font-semibold">Our Mission</h2>
            <p className="leading-relaxed text-zinc-400">
              We believe that every project deserves a great README. Our mission is to simplify the process of 
              documenting your work, allowing you to focus on what matters most: building amazing software.
            </p>
          </section>

          <div className="flex justify-center gap-4">
            <a 
              href="https://github.com/BrandonBlkk/bran-readme" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600"
            >
              <Github size={20} />
              <span>View on GitHub</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About

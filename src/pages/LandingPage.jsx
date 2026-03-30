import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Layers,
  Eye,
  Palette,
  Copy,
  GripVertical,
  Sparkles,
  Github,
  MessageSquare,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { getCurrentUser, signOut, onAuthStateChange } from '../services/authService'
import AuthModal from '../components/auth/AuthModal'
import FeedbackModal from '../components/feedback/FeedbackModal'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
}

const LandingPage = () => {
    const [isBeta, setIsBeta] = useState(true);
    const [isScrolling, setIsScrolling] = useState(false);
    const [user, setUser] = useState(null)
    const [isAuthOpen, setIsAuthOpen] = useState(false)
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)

    useEffect(() => {
        getCurrentUser().then(setUser)
        const { data: { subscription } } = onAuthStateChange(setUser)
        return () => subscription.unsubscribe()
    }, [])

    const handleScroll = () => {
        setIsScrolling(window.scrollY > 0);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] antialiased selection:bg-white/10">
        {/* ─── Navbar ─── */}
        <nav
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
            isScrolling 
            ? 'bg-[#0a0a0a]/80 backdrop-blur-md' 
            : 'bg-transparent'
        }`}
        >
            <div 
                className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-300 lg:px-8 ${
                isScrolling ? 'py-4' : 'py-6'
                }`}
            >
                {/* Combined Logo and Text into one Flex container */}
                <div className="flex items-center gap-2">
                    <Link
                        to="/landing"
                        className="flex h-8 w-8 items-center justify-center rounded-lg cursor-pointer"
                    >
                        <img
                        src="/logo.svg"
                        alt="Profile"
                        className="h-5 w-5 rounded-full select-none"
                        />
                    </Link>
                    <span className="text-lg font-semibold tracking-tight text-white">
                        BranReadme
                    </span>
                    { isBeta ?
                        <span className="rounded-full border border-rose-800 bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-rose-400 select-none">
                        Beta
                        </span> :
                        <span className="rounded-full border border-zinc-600 bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-zinc-400 select-none">
                        v1.0
                        </span>
                    }
                </div>

                <div className="hidden items-center gap-8 text-sm text-[#a3a3a3] md:flex">
                    <a href="#features" className="transition-colors hover:text-white">Features</a>
                    <a href="#workflow" className="transition-colors hover:text-white">How It Works</a>
                    <a href="#templates" className="transition-colors hover:text-white">Templates</a>
                    
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-zinc-500">Hi, {user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
                            <button
                                onClick={() => signOut()}
                                className="text-xs transition-colors hover:text-white"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAuthOpen(true)}
                            className="transition-colors hover:text-white"
                        >
                            Sign In
                        </button>
                    )}

                    <Link
                        to="/"
                        className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-[#0a0a0a] transition-opacity hover:opacity-90"
                    >
                        Open Builder
                    </Link>
                </div>

                {/* Mobile CTA */}
                <Link
                to="/"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#0a0a0a] md:hidden"
                >
                Open Builder
                </Link>
            </div>
        </nav>

        {/* ─── Hero ─── */}
        <header className="mx-auto max-w-6xl px-6 pb-24 pt-24 sm:pt-16 lg:px-8 lg:pt-32">
            <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]"
            >
            <motion.div variants={fadeUp}>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#737373]">
                readme builder
                </p>

                <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
                Ship a GitHub profile that actually
                <span className="text-[#737373]"> looks&nbsp;good.</span>
                </h1>

                <p className="mt-6 max-w-lg text-base leading-relaxed text-[#a3a3a3] sm:text-lg">
                Design polished README files with drag-and-drop sections, live preview, and one-click export. No design skills needed.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
                >
                    Start Building
                    <ArrowRight size={16} />
                </Link>
                <a
                    href="#features"
                    className="inline-flex items-center justify-center rounded-lg border border-[#262626] px-6 py-3 text-sm font-medium text-[#e5e5e5] transition-colors hover:border-[#404040] hover:text-white"
                >
                    See Features
                </a>
                </div>

                {/* Stats */}
                <div className="mt-12 flex flex-wrap items-center gap-8">
                {[
                    { value: '120+', label: 'Section blocks' },
                    { value: 'Live', label: 'GitHub preview' },
                    { value: '1‑click', label: 'MD export' },
                ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-3 text-sm">
                    <span className="font-mono font-medium text-white">{stat.value}</span>
                    <span className="text-[#525252]">{stat.label}</span>
                    </div>
                ))}
                </div>
            </motion.div>

            {/* Hero Card - generator preview */}
            <motion.div variants={fadeUp}>
                <div className="rounded-3xl border border-[#1c1c1c] bg-[#101010] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
                    <div className="flex items-center gap-1.5 pb-5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500/50 border border-red-500/10" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/50 border border-amber-500/10" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/50 border border-emerald-500/10" />
                        <span className="ml-3 font-mono text-[11px] uppercase tracking-[0.35em] text-[#4a4a4a]">preview.md</span>
                    </div>

                    <div className="rounded-2xl border border-[#1c1c1c] bg-[#0b0b0b] p-5">
                        <h3 className="text-xl font-semibold text-white">Hi, I'm Brandon 👋 </h3>
                        <div className="mt-3 h-px bg-[#262626]" />
                        <p className="mt-3 text-sm text-[#d4d4d4]">Designing developer experiences that ship.</p>
                        <p className="mt-2 text-sm text-[#d4d4d4]">Location: <span className="font-semibold text-white">San Francisco, CA</span> | <span className="text-blue-400">Website</span></p>

                        <div className="mt-3 h-px bg-[#262626]" />
                        <div className="mt-3 rounded-xl border border-[#1f1f1f] bg-[#101010] p-4 select-none">
                            <img
                                src="https://github-readme-stats-delta-eight-12.vercel.app/api?username=BrandonBlkk&show_icons=true&hide_border=true&theme=transparent&count_private=true&title_color=58a6ff&text_color=c9d1d9&icon_color=58a6ff&rank_color=58a6ff&text_bold=true"
                                alt="GitHub stats"
                                className="w-full max-w-sm"
                            />
                        </div>

                        <h4 className="mt-6 text-base font-semibold text-white">Tech Stack</h4>
                        <div className="mt-3 h-px bg-[#262626]" />
                        <div className="mt-3 flex flex-wrap gap-2 select-none">
                        {['react', 'ts', 'tailwind', 'vite', 'nodejs'].map((icon) => (
                            <img
                            key={icon}
                            src={`https://skillicons.dev/icons?i=${icon}&theme=dark`}
                            alt={icon}
                            className="h-8 w-8"
                            />
                        ))}
                        </div>
                    </div>
                </div>
            </motion.div>
            </motion.div>
        </header>

        {/* ─── Divider ─── */}
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="h-px bg-[#1c1c1c]" />
        </div>

        {/* ─── Features ─── */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
            <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            >
            <motion.div variants={fadeUp}>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#525252]">
                Features
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Everything you need to ship fast.
                </h2>
                <p className="mt-4 max-w-lg text-base text-[#737373]">
                No code, no fuss. Drag sections, pick a theme, and export clean markdown in minutes.
                </p>
            </motion.div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[
                {
                    icon: <Eye size={20} />,
                    title: 'Live Preview',
                    body: 'See every edit reflected instantly in a real GitHub-style markdown preview.',
                },
                {
                    icon: <GripVertical size={20} />,
                    title: 'Drag & Drop',
                    body: 'Reorder sections, tech icons, and highlights with smooth drag-and-drop.',
                },
                {
                    icon: <Palette size={20} />,
                    title: 'Theme Studio',
                    body: 'Tune colors, spacing, and stat cards without writing a single line of CSS.',
                },
                {
                    icon: <Layers size={20} />,
                    title: 'Smart Sections',
                    body: 'Pre-built blocks for tech stacks, pinned repos, banners, and social links.',
                },
                {
                    icon: <Copy size={20} />,
                    title: 'One-Click Export',
                    body: 'Copy clean markdown to your clipboard — paste into GitHub and you\'re live.',
                },
                {
                    icon: <Sparkles size={20} />,
                    title: 'Polished Output',
                    body: 'Every export is formatted, valid, and ready to impress recruiters and peers.',
                },
                ].map((card) => (
                <motion.div
                    key={card.title}
                    variants={fadeUp}
                    className="group rounded-xl border border-[#1c1c1c] bg-[#111111] p-6 transition-colors hover:border-[#262626]"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#262626] text-[#a3a3a3] transition-colors group-hover:text-white">
                    {card.icon}
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-white">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#737373]">{card.body}</p>
                </motion.div>
                ))}
            </div>
            </motion.div>
        </section>

        {/* ─── Divider ─── */}
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="h-px bg-[#1c1c1c]" />
        </div>

        {/* ─── Workflow ─── */}
        <section id="workflow" className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
            <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            >
            <motion.div variants={fadeUp}>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#525252]">
                How It Works
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Three steps. That's it.
                </h2>
            </motion.div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
                {[
                {
                    step: '01',
                    title: 'Pick a template',
                    body: 'Choose from curated layouts or start from scratch with a blank canvas.',
                },
                {
                    step: '02',
                    title: 'Customize everything',
                    body: 'Drag sections, edit text inline, add your tech stack and social links.',
                },
                {
                    step: '03',
                    title: 'Export & publish',
                    body: 'Copy the markdown, paste into your GitHub profile, and you\'re done.',
                },
                ].map((item) => (
                <motion.div
                    key={item.step}
                    variants={fadeUp}
                    className="rounded-xl border border-[#1c1c1c] bg-[#111111] p-6"
                >
                    <p className="font-mono text-sm font-medium text-[#404040]">{item.step}</p>
                    <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#737373]">{item.body}</p>
                </motion.div>
                ))}
            </div>
            </motion.div>
        </section>

        {/* ─── Divider ─── */}
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="h-px bg-[#1c1c1c]" />
        </div>

        {/* ─── Templates ─── */}
        <section id="templates" className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
            <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            >
            <motion.div variants={fadeUp} className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#525252]">
                    Templates
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Start with a base. Make it yours.
                </h2>
                </div>
                <Link
                to="/templates"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#262626] px-5 py-2.5 text-sm font-medium text-[#e5e5e5] transition-colors hover:border-[#404040] hover:text-white"
                >
                View All
                <ArrowRight size={14} />
                </Link>
            </motion.div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
                {[
                { name: 'Minimal', desc: 'Clean layout with refined spacing and a dark tone.' },
                { name: 'Studio', desc: 'Balanced sections built for versatile developer profiles.' },
                { name: 'Signal', desc: 'Compact, scannable layout for quick first impressions.' },
                ].map((t) => (
                <motion.div
                    key={t.name}
                    variants={fadeUp}
                    className="group rounded-xl border border-[#1c1c1c] bg-[#111111] p-6 transition-colors hover:border-[#262626]"
                >
                    <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-white">{t.name}</h3>
                    <span className="rounded-md border border-[#262626] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#525252]">
                        template
                    </span>
                    </div>
                    <div className="mt-5 space-y-2">
                    <div className="h-1.5 w-20 rounded-full bg-[#262626]" />
                    <div className="h-1.5 w-28 rounded-full bg-[#1c1c1c]" />
                    <div className="h-1.5 w-16 rounded-full bg-[#1c1c1c]" />
                    </div>
                    <p className="mt-5 text-sm text-[#737373]">{t.desc}</p>
                </motion.div>
                ))}
            </div>
            </motion.div>
        </section>

        {/* ─── Divider ─── */}
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="h-px bg-[#1c1c1c]" />
        </div>

        {/* ─── CTA ─── */}
        <section className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
            <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="flex flex-col items-center text-center"
            >
            <motion.h2
                variants={fadeUp}
                className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
                Ready to build your profile?
            </motion.h2>
            <motion.p
                variants={fadeUp}
                className="mt-4 max-w-md text-base text-[#737373]"
            >
                No credit card. No lock‑in. Just markdown.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
                <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
                >
                Start Now
                <ArrowRight size={16} />
                </Link>
            </motion.div>
            </motion.div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="border-t border-[#1c1c1c]">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-[#404040] sm:flex-row lg:px-8">
            <p>&copy; 2026 BranReadme. Built for builders.</p>
            <div className="flex items-center gap-5">
                <a href="https://github.com/BrandonBlkk/bran-readme" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
                <Github size={16} />
                </a>
                <button 
                  onClick={() => setIsFeedbackOpen(true)}
                  className="flex items-center gap-1.5 transition-colors hover:text-white"
                >
                  <MessageSquare size={14} />
                  Feedback
                </button>
            </div>
            </div>
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
        </footer>
        </div>
    )
}

export default LandingPage

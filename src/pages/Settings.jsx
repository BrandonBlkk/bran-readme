import React, { useMemo } from 'react'
import { User } from 'lucide-react'
import { toast } from 'sonner'
import Footer from '../components/Footer'
import ResetButton from '../components/ResetButton'
import Sidebar from '../components/Sidebar'
import { useProfileStore } from '../stores/profileStore'

const labelClass = 'text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500'
const inputClass =
  'w-full rounded-lg border border-zinc-800 bg-zinc-950 mt-2 px-3 py-2 text-[13px] font-mono text-zinc-50 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15'

const Settings = () => {
  const currentYear = 2026
  const profile = useProfileStore((state) => state.profile)
  const updateProfile = useProfileStore((state) => state.updateProfile)
  const resetProfile = useProfileStore((state) => state.resetProfile)

  const profileHint = useMemo(
    () => `${profile.displayName} - ${profile.githubUser}`,
    [profile.displayName, profile.githubUser],
  )

  const resetAll = () => {
    resetProfile()
    toast.success('Profile settings restored.')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 font-sans text-zinc-50 antialiased selection:bg-blue-500 selection:text-white">
      <Sidebar activePanel="settings" onPanelChange={() => {}} />

      <div className="ml-0 lg:ml-12 flex h-screen min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-4 py-5 lg:px-10">
          <div className="space-y-3">
            <header className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] lg:p-8">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 select-none">
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-blue-400">
                  Settings
                </span>
                <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-zinc-400">
                  Workspace {currentYear}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-zinc-50 sm:text-3xl">
                    Personalize BranReadme
                  </h1>
                  <p className="mt-3 max-w-2xl text-xs leading-relaxed text-zinc-400 sm:text-sm">
                    Update the profile details the README builder actually uses across your
                    workspace.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ResetButton
                    label="Reset to defaults"
                    onClick={resetAll}
                    className="lg:px-3 lg:py-1.5"
                  />
                </div>
              </div>
            </header>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 lg:p-7">
              <h2 className="mb-5 flex items-center gap-3 text-sm font-semibold sm:text-base">
                <User size={18} className="text-blue-400" />
                Profile
              </h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className={labelClass}>Display Name</p>
                  <input
                    className={inputClass}
                    value={profile.displayName}
                    onChange={(e) => updateProfile('displayName', e.target.value)}
                  />
                  <p className="mt-2 text-[11px] text-zinc-600">
                    Shown in header templates and exports.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className={labelClass}>GitHub Username</p>
                  <input
                    className={inputClass}
                    value={profile.githubUser}
                    onChange={(e) => updateProfile('githubUser', e.target.value)}
                  />
                  <p className="mt-2 text-[11px] text-zinc-600">
                    Used for stats cards and GitHub links.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 md:col-span-2">
                  <p className={labelClass}>Website</p>
                  <input
                    className={inputClass}
                    value={profile.website ?? ''}
                    onChange={(e) => updateProfile('website', e.target.value)}
                    placeholder="https://brandondevme.vercel.app"
                  />
                  <p className="mt-2 text-[11px] text-zinc-600">
                    Used as the default website link in header templates.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 md:col-span-2">
                  <p className={labelClass}>Location</p>
                  <input
                    className={inputClass}
                    value={profile.location ?? ''}
                    onChange={(e) => updateProfile('location', e.target.value)}
                    placeholder="Yangon, Myanmar"
                  />
                  <p className="mt-2 text-[11px] text-zinc-600">
                    Used as the default location in header templates.
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                <p className="text-xs text-zinc-400">
                  Active profile: <span className="font-semibold text-zinc-200">{profileHint}</span>
                </p>
              </div>
            </section>

            <Footer label="profile settings" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

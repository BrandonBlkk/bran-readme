import React, { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import ResetButton from '../components/ResetButton'
import {
  Settings as SettingsIcon,
  User,
  Sliders,
  Shield,
  Cloud,
  Download,
  Moon,
  Sun,
} from 'lucide-react'
import { toast } from 'sonner'

const labelClass = 'text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500'
const inputClass =
  'w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-[13px] font-mono text-zinc-50 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15'

const defaultPreferences = {
  autosave: true,
  compactSidebar: false,
  reduceMotion: false,
  emailUpdates: true,
  localOnly: true,
  cloudSync: false,
}

const defaultProfile = {
  displayName: 'Jane Developer',
  githubUser: 'octocat',
  role: 'Frontend Engineer',
  location: 'San Francisco, CA',
  template: 'starter',
}

const defaultExport = {
  fileName: 'README.md',
  lineWidth: 80,
  includeToc: true,
  includeBadges: true,
  includeFooter: false,
}

const ToggleRow = ({ title, description, checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex w-full items-start justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-left transition-all duration-150 hover:border-zinc-700 cursor-pointer"
  >
    <div>
      <p className="text-sm font-semibold text-zinc-50">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{description}</p>
    </div>
    <span
      className={`relative mt-1 inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-blue-500' : 'bg-zinc-800'
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
          checked ? 'translate-x-4.5' : 'translate-x-0.5'
        }`}
      />
    </span>
  </button>
)

const Settings = () => {
  const currentYear = 2026
  const [preferences, setPreferences] = useState(defaultPreferences)
  const [profile, setProfile] = useState(defaultProfile)
  const [exportDefaults, setExportDefaults] = useState(defaultExport)
  const [theme, setTheme] = useState('dark')

  const profileHint = useMemo(
    () => `${profile.displayName} · ${profile.githubUser}`,
    [profile.displayName, profile.githubUser],
  )

  const updateProfile = (field, value) =>
    setProfile((prev) => ({ ...prev, [field]: value }))

  const updateExport = (field, value) =>
    setExportDefaults((prev) => ({ ...prev, [field]: value }))

  const resetAll = () => {
    setPreferences(defaultPreferences)
    setProfile(defaultProfile)
    setExportDefaults(defaultExport)
    setTheme('dark')
    toast.success('Defaults settings restored.')
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
                    Tune how the builder behaves, choose your defaults, and decide what gets saved. All changes are local to this device unless you enable sync.
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
                Profile & Workspace
              </h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className={labelClass}>Display Name</p>
                  <input
                    className={inputClass}
                    value={profile.displayName}
                    onChange={(e) => updateProfile('displayName', e.target.value)}
                  />
                  <p className="mt-2 text-[11px] text-zinc-600">Shown in header templates and exports.</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className={labelClass}>GitHub Username</p>
                  <input
                    className={inputClass}
                    value={profile.githubUser}
                    onChange={(e) => updateProfile('githubUser', e.target.value)}
                  />
                  <p className="mt-2 text-[11px] text-zinc-600">Used for stats cards and links.</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className={labelClass}>Role</p>
                  <input
                    className={inputClass}
                    value={profile.role}
                    onChange={(e) => updateProfile('role', e.target.value)}
                  />
                  <p className="mt-2 text-[11px] text-zinc-600">Appears in starter templates.</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className={labelClass}>Default Template</p>
                  <select
                    className={inputClass}
                    value={profile.template}
                    onChange={(e) => updateProfile('template', e.target.value)}
                  >
                    <option value="starter">Starter</option>
                    <option value="minimal">Minimal</option>
                    <option value="bold">Bold</option>
                    <option value="showcase">Showcase</option>
                  </select>
                  <p className="mt-2 text-[11px] text-zinc-600">Applied when you create a new README.</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                <p className="text-xs text-zinc-400">
                  Active profile: <span className="font-semibold text-zinc-200">{profileHint}</span>
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 lg:p-7">
              <h2 className="mb-5 flex items-center gap-3 text-sm font-semibold sm:text-base">
                <Sliders size={18} className="text-blue-400" />
                Editor Preferences
              </h2>
              <div className="grid grid-cols-1 gap-2">
                <ToggleRow
                  title="Auto-save changes"
                  description="Keep templates saved locally every few seconds."
                  checked={preferences.autosave}
                  onChange={(value) => setPreferences((prev) => ({ ...prev, autosave: value }))}
                />
              </div>
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <p className={`${labelClass} mb-2`}>Default Preview Theme</p>
                <div className="flex items-center gap-2 select-none">
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'border-zinc-700 bg-zinc-900 text-zinc-50'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Moon size={14} className="text-blue-400" />
                    Dark
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'border-zinc-700 bg-zinc-900 text-zinc-50'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Sun size={14} className="text-amber-300" />
                    Light
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 lg:p-7">
              <h2 className="mb-5 flex items-center gap-3 text-sm font-semibold sm:text-base">
                <SettingsIcon size={18} className="text-blue-400" />
                Export Defaults
              </h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className={labelClass}>File Name</p>
                  <input
                    className={inputClass}
                    value={exportDefaults.fileName}
                    onChange={(e) => updateExport('fileName', e.target.value)}
                  />
                  <p className="mt-2 text-[11px] text-zinc-600">Default file name when exporting markdown.</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className={labelClass}>Line Width</p>
                  <input
                    type="number"
                    min="40"
                    max="120"
                    className={inputClass}
                    value={exportDefaults.lineWidth}
                    onChange={(e) => updateExport('lineWidth', Number(e.target.value))}
                  />
                  <p className="mt-2 text-[11px] text-zinc-600">Used when wrapping long paragraphs.</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <ToggleRow
                  title="Include badge row"
                  description="Prepends commonly used badges to the header."
                  checked={exportDefaults.includeBadges}
                  onChange={(value) => updateExport('includeBadges', value)}
                />
                <ToggleRow
                  title="Add footer signature"
                  description="Adds a small footer signature to each export."
                  checked={exportDefaults.includeFooter}
                  onChange={(value) => updateExport('includeFooter', value)}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 lg:p-7">
              <h2 className="mb-5 flex items-center gap-3 text-sm font-semibold sm:text-base">
                <Shield size={18} className="text-blue-400" />
                Data & Privacy
              </h2>
              <div className="grid grid-cols-1 gap-2">
                <ToggleRow
                  title="Store templates locally"
                  description="Saves README layouts in your browser for instant reloads."
                  checked={preferences.localOnly}
                  onChange={(value) => setPreferences((prev) => ({ ...prev, localOnly: value }))}
                />
                <ToggleRow
                  title="Cloud sync"
                  description="Back up templates to the cloud so they follow you everywhere."
                  checked={preferences.cloudSync}
                  onChange={(value) => setPreferences((prev) => ({ ...prev, cloudSync: value }))}
                />
                <ToggleRow
                  title="Email product updates"
                  description="Receive release notes and new template drops."
                  checked={preferences.emailUpdates}
                  onChange={(value) => setPreferences((prev) => ({ ...prev, emailUpdates: value }))}
                />
              </div>
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Cloud size={14} className="text-blue-400" />
                  Sync status: <span className="font-semibold text-zinc-200">Local only</span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 lg:p-7">
              <h2 className="mb-5 flex items-center gap-3 text-sm font-semibold sm:text-base">
                <Download size={18} className="text-blue-400" />
                Backup & Restore
              </h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-sm font-semibold text-zinc-50">Download backup</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Export a JSON snapshot of your templates and settings.
                  </p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-500 bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-blue-600 cursor-pointer"
                  >
                    <Download size={14} />
                    Export JSON
                  </button>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-sm font-semibold text-zinc-50">Restore templates</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Import a previously exported JSON file to restore your workspace.
                  </p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-200 transition-all hover:border-zinc-700 hover:bg-[#1e1e22] select-none cursor-pointer"
                  >
                    Upload backup
                  </button>
                </div>
              </div>
            </section>

            <footer className="py-6 text-center">
              <p className="text-[9px] uppercase tracking-widest text-zinc-600 sm:text-[10px] mb-12 lg:mb-0">
                © {currentYear} BranReadme - settings overview
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

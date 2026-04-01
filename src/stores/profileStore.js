import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const normalizeValue = (value) => String(value ?? '').trim()
const isObject = (value) => value !== null && typeof value === 'object'

export const DEFAULT_PROFILE = {
  displayName: 'Brandon Developer',
  githubUser: 'BrandonBlkk',
  website: 'https://brandondevme.vercel.app',
  location: 'Yangon, Myanmar',
}

const buildProfileDefaults = (githubAccount = null) => ({
  displayName: normalizeValue(githubAccount?.displayName) || DEFAULT_PROFILE.displayName,
  githubUser: normalizeValue(githubAccount?.username) || DEFAULT_PROFILE.githubUser,
  website: '',
  location: '',
})

const resolveProfile = (profile = {}, githubAccount = null) => {
  const defaults = buildProfileDefaults(githubAccount)
  return {
    ...defaults,
    ...profile,
    displayName: normalizeValue(profile.displayName) || defaults.displayName,
    githubUser: normalizeValue(profile.githubUser) || defaults.githubUser,
    website: normalizeValue(profile.website) || DEFAULT_PROFILE.website,
    location: normalizeValue(profile.location) || DEFAULT_PROFILE.location,
  }
}

const normalizeOptionalProfileField = (value, fallbackValue) => {
  const normalized = normalizeValue(value)
  if (!normalized) return ''
  return normalized === normalizeValue(fallbackValue) ? '' : normalized
}

const migratePersistedProfile = (persistedState) => {
  if (!isObject(persistedState)) return persistedState

  const profile = isObject(persistedState.profile) ? persistedState.profile : {}

  return {
    ...persistedState,
    profile: {
      ...profile,
      website: normalizeOptionalProfileField(profile.website, DEFAULT_PROFILE.website),
      location: normalizeOptionalProfileField(profile.location, DEFAULT_PROFILE.location),
    },
  }
}

const shouldReplaceWithSyncedValue = (currentValue, fallbackValue, previousSyncedValue) => {
  const current = normalizeValue(currentValue)
  if (!current) return true
  if (current === normalizeValue(fallbackValue)) return true
  if (previousSyncedValue && current === normalizeValue(previousSyncedValue)) return true
  return false
}

export const useProfileStore = create(
  persist(
    (set) => ({
      profile: buildProfileDefaults(),
      githubAccount: null,
      updateProfile: (field, value) =>
        set((state) => ({
          profile: { ...state.profile, [field]: value },
        })),
      resetProfile: () =>
        set((state) => ({
          profile: buildProfileDefaults(state.githubAccount),
        })),
      syncGithubAccount: (githubAccount) => {
        const nextAccount = githubAccount
          ? {
              username: normalizeValue(githubAccount.username),
              displayName: normalizeValue(githubAccount.displayName),
              avatarUrl: normalizeValue(githubAccount.avatarUrl),
              email: normalizeValue(githubAccount.email),
            }
          : null

        if (!nextAccount || (!nextAccount.username && !nextAccount.displayName)) return

        set((state) => ({
          githubAccount: nextAccount,
          profile: {
            ...state.profile,
            displayName: shouldReplaceWithSyncedValue(
              state.profile.displayName,
              DEFAULT_PROFILE.displayName,
              state.githubAccount?.displayName,
            )
              ? (nextAccount.displayName || state.profile.displayName)
              : state.profile.displayName,
            githubUser: shouldReplaceWithSyncedValue(
              state.profile.githubUser,
              DEFAULT_PROFILE.githubUser,
              state.githubAccount?.username,
            )
              ? (nextAccount.username || state.profile.githubUser)
              : state.profile.githubUser,
          },
        }))
      },
    }),
    {
      name: 'branreadme-profile-store',
      version: 1,
      migrate: (persistedState) => migratePersistedProfile(persistedState),
      partialize: (state) => ({
        profile: state.profile,
        githubAccount: state.githubAccount,
      }),
    },
  ),
)

export const getProfileDefaults = () =>
  buildProfileDefaults(useProfileStore.getState().githubAccount)

export const getResolvedProfile = () => {
  const state = useProfileStore.getState()
  return resolveProfile(state.profile, state.githubAccount)
}

export const getDefaultDisplayName = () => getResolvedProfile().displayName

export const getDefaultGithubUsername = () => getResolvedProfile().githubUser

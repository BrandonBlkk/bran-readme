import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const normalizeValue = (value) => String(value ?? '').trim()

export const DEFAULT_PROFILE = {
  displayName: 'Brandon Developer',
  githubUser: 'BrandonBlkk',
  role: 'Backend Web Developer',
  location: 'Yangon, Myanmar',
  template: 'starter',
}

const buildProfileDefaults = (githubAccount = null) => ({
  ...DEFAULT_PROFILE,
  displayName: normalizeValue(githubAccount?.displayName) || DEFAULT_PROFILE.displayName,
  githubUser: normalizeValue(githubAccount?.username) || DEFAULT_PROFILE.githubUser,
})

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
      partialize: (state) => ({
        profile: state.profile,
        githubAccount: state.githubAccount,
      }),
    },
  ),
)

export const getProfileDefaults = () =>
  buildProfileDefaults(useProfileStore.getState().githubAccount)

export const getDefaultGithubUsername = () => getProfileDefaults().githubUser

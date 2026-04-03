import { useEffect } from 'react'
import { getCurrentUser, onAuthStateChange } from '../services/authService'
import { useProfileStore } from '../stores/profileStore'
import { extractGithubAccount } from '../utils/githubAccount'

const useGithubProfileSync = () => {
  const syncGithubAccount = useProfileStore((state) => state.syncGithubAccount)

  useEffect(() => {
    let active = true

    const applyUser = (user) => {
      if (!active) return
      const githubAccount = extractGithubAccount(user)
      if (githubAccount) {
        syncGithubAccount(githubAccount)
      }
    }

    getCurrentUser().then(applyUser).catch(() => {})

    const { data: { subscription } } = onAuthStateChange(applyUser)

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [syncGithubAccount])
}

export default useGithubProfileSync

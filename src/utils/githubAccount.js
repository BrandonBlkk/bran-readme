const getTrimmedValue = (value) => String(value ?? '').trim()

const pickFirstValue = (...values) =>
  values.map(getTrimmedValue).find(Boolean) ?? ''

const getGithubIdentity = (user) => {
  const identities = Array.isArray(user?.identities) ? user.identities : []
  return identities.find((identity) => identity?.provider === 'github') ?? null
}

export const hasGithubIdentity = (user) => {
  const providers = Array.isArray(user?.app_metadata?.providers)
    ? user.app_metadata.providers
    : []

  return (
    user?.app_metadata?.provider === 'github'
    || providers.includes('github')
    || Boolean(getGithubIdentity(user))
  )
}

export const extractGithubAccount = (user) => {
  if (!user || !hasGithubIdentity(user)) return null

  const metadata = user.user_metadata ?? {}
  const identityData = getGithubIdentity(user)?.identity_data ?? {}
  const email = pickFirstValue(user.email, metadata.email, identityData.email)
  const username = pickFirstValue(
    metadata.user_name,
    metadata.preferred_username,
    metadata.username,
    metadata.login,
    identityData.user_name,
    identityData.preferred_username,
    identityData.username,
    identityData.login,
  )
  const displayName = pickFirstValue(
    metadata.full_name,
    metadata.name,
    identityData.full_name,
    identityData.name,
    username,
    email ? email.split('@')[0] : '',
  )

  if (!username && !displayName) return null

  return {
    username,
    displayName,
    avatarUrl: pickFirstValue(metadata.avatar_url, identityData.avatar_url),
    email,
  }
}

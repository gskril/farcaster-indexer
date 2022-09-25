import got from 'got'
import supabase from '../supabase.js'
import { FlattenedProfile, Profile } from '../types/index.js'

export async function updateAllProfiles() {
  const { data: _profiles, error: profilesError } = await supabase
    .from('profiles_new')
    .select('*')
    .order('id', { ascending: true })

  if (!_profiles || _profiles.length === 0 || profilesError) {
    throw new Error('No profiles found.')
  }

  const profiles: FlattenedProfile[] = _profiles
  const updatedProfiles: FlattenedProfile[] = []
  let i = 0

  for (const profile of profiles) {
    const res: any = await got(
      `https://api.farcaster.xyz/v1/profiles/${profile.address}`
    ).json()

    if (res.error) {
      throw new Error(res.error)
    }

    const p: Profile = res.result.user

    const connectedAddress = await getConnectedAddress(p.address)

    updatedProfiles.push({
      id: profile.id,
      address: p.address,
      username: p.username,
      display_name: p.displayName,
      avatar_url: p.avatar.url,
      avatar_verified: p.avatar.isVerified,
      followers: p.followerCount,
      following: p.followingCount,
      bio: p.profile.bio.text,
      telegram: p.profile.directMessageTargets?.telegram || null,
      referrer: p.referrerUsername || null,
      connected_address: connectedAddress,
      updated_at: new Date(),
    })
  }

  const { error: updateError } = await supabase
    .from('profiles_new')
    .upsert(updatedProfiles, { onConflict: 'id' })

  if (updateError) {
    throw updateError
  } else {
    console.log('Updated profiles.')
  }

  return updatedProfiles
}

async function getConnectedAddress(address: string) {
  const res: any = await got(
    `https://api.farcaster.xyz/v1/verified_addresses/${address}`
  ).json()

  if (res.error) {
    return null
  } else {
    return res.result?.verifiedAddresses[0]?.signerAddress || null
  }
}

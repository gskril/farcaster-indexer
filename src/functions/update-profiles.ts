import got from 'got'
import supabase from '../supabase.js'
import { FlattenedProfile, Profile } from '../types/index.js'
import { breakIntoChunks } from '../utils.js'

export async function updateAllProfiles() {
  const startTime = new Date()
  console.log('Updating profiles...')
  const { data: _profiles, error: profilesError } = await supabase
    .from('profiles_new')
    .select('*')
    .order('id', { ascending: true })

  if (!_profiles || _profiles.length === 0 || profilesError) {
    throw new Error('No profiles found.')
  }

  const profiles: FlattenedProfile[] = _profiles
  const updatedProfiles: FlattenedProfile[] = []

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
      avatar_url: p.avatar?.url || null,
      avatar_verified: p.avatar?.isVerified || false,
      followers: p.followerCount,
      following: p.followingCount,
      bio: p.profile?.bio?.text || null,
      telegram: p.profile?.directMessageTargets?.telegram || null,
      referrer: p.referrerUsername || null,
      connected_address: connectedAddress,
      updated_at: new Date(),
    })
  }

  // Break profiles into chunks of 100
  const chunks = breakIntoChunks(updatedProfiles, 100)
  for (const chunk of chunks) {
    const { error } = await supabase
      .from('profiles_new')
      .upsert(chunk, { onConflict: 'id' })

    if (error) {
      console.error('Error inserting chunk of profiles.', error)
      return
    }
  }

  const endTime = new Date()
  const elapsedTime = (endTime.getTime() - startTime.getTime()) / 1000
  console.log(`Updated ${profiles.length} profiles in ${elapsedTime} seconds.`)
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

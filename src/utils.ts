import got from 'got'
import supabase from './supabase.js'
import { Cast, FlattenedProfile, Profile } from './types'

/**
 * Get the display name and follower count of a Farcaster profile.
 * @param {string} address Farcaster account address
 * @returns {Profile | null} Object with a profile's display name and follower count
 */
export async function getProfileInfo(
  farcasterAddress: string
): Promise<Profile | null> {
  try {
    return await got(
      `https://api.farcaster.xyz/v1/profiles/${farcasterAddress}`
    ).json()
  } catch (err) {
    console.error(`Error getting profile info for ${farcasterAddress}.`, err)
    return null
  }
}

/**
 * Remove recasts
 * @param activity Farcaster user activity
 * @returns Farcaster user activity without recasts
 */
export function cleanUserActivity(activity: Cast[]) {
  // Get the merkle root of all casts that were deleted by the user
  const deletedCasts = activity
    .filter((cast: any) => {
      return cast.body.data.text.startsWith('delete:farcaster://casts/')
    })
    .map((cast: any) => {
      return cast.body.data.text.split('delete:farcaster://casts/')[1]
    })

  // Remove deleted casts and recasts
  const cleanedActivity = activity.filter((cast: any) => {
    return (
      // !deletedCasts.includes(cast.merkleRoot) &&
      // !cast.body.data.text.startsWith('delete:') &&
      !cast.body.data.text.startsWith('recast:')
    )
  })

  return cleanedActivity
}

/**
 * Break a large array into smaller chunks.
 * @param {array} array Array to break into smaller chunks
 * @param {number} chunkSize Size of each chunk
 * @returns {array} Array of smaller chunks
 */
export function breakIntoChunks(array: any[], chunkSize: number) {
  const chunks = Array()
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

/**
 * Used in migration to keep the original registered_at date for profiles
 */
export async function getRegisteredDateFromOldTable() {
  const profilesToUpdate: FlattenedProfile[] = new Array()

  const { data: oldProfiles } = await supabase
    .from('profiles')
    .select('username, connected_address, registered_at')

  const { data: newProfiles } = await supabase
    .from('profiles_new')
    .select('*')
    .order('id', { ascending: true })

  newProfiles!.map((p) => {
    if (p.connected_address !== null) {
      // find the matching old profile by connected_address
      const oldProfile = oldProfiles!.find(
        (op: any) => op.connected_address === p.connected_address
      )

      if (oldProfile) {
        // set the registered_at of the new profile to the old profile's registered_at
        p.registered_at = new Date(oldProfile.registered_at)
        profilesToUpdate.push(p)
      } else {
        console.log('no address to match for', p.username)
      }
    } else {
      console.log('no address to match for', p.username)
    }
  })

  const { error } = await supabase.from('profiles_new').upsert(profilesToUpdate)
  if (error) {
    console.log(error)
  } else {
    console.log('updated all registered_at dates')
  }
}

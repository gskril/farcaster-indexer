import got from 'got'
import { Cast, Profile } from './types'

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

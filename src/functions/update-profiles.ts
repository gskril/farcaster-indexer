import got from 'got'

import { MERKLE_REQUEST_OPTIONS } from '../merkle.js'
import supabase from '../supabase.js'
import { FlattenedProfile, MerkleResponse, Profile } from '../types/index.js'
import { breakIntoChunks } from '../utils.js'

/**
 * Reformat and upsert all profiles into the database
 */
export async function updateAllProfiles() {
  const startTime = Date.now()
  const allProfiles = await getAllProfiles()

  const formattedProfiles: FlattenedProfile[] = allProfiles.map((p) => {
    return {
      id: p.fid,
      username: p.username,
      display_name: p.displayName || null,
      avatar_url: p.pfp?.url || null,
      avatar_verified: p.pfp?.verified || false,
      followers: p.followerCount,
      following: p.followingCount,
      bio: p.profile?.bio?.text || null,
      referrer: p?.referrerUsername || null,
      updated_at: new Date(),
    }
  })

  // Upsert profiles in chunks to avoid locking the table
  const chunks = breakIntoChunks(formattedProfiles, 500)
  for (const chunk of chunks) {
    const { error } = await supabase
      .from('profiles')
      .upsert(chunk, { onConflict: 'id' })

    if (error) {
      throw error
    }
  }

  const endTime = Date.now()
  const duration = (endTime - startTime) / 1000

  const length = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(allProfiles.length)

  console.log(`Updated ${length} profiles in ${duration} seconds`)
}

/**
 * Get all profiles from the Merkle API
 * @returns An array of all Farcaster profiles
 */
async function getAllProfiles(): Promise<Profile[]> {
  const allProfiles: Profile[] = new Array()
  let endpoint = buildProfileEndpoint()

  while (true) {
    const _response = await got(endpoint, MERKLE_REQUEST_OPTIONS).json()

    const response = _response as MerkleResponse
    const profiles = response.result.users

    if (!profiles) throw new Error('No profiles found')

    for (const profile of profiles) {
      allProfiles.push(profile)
    }

    // If there are more profiles, get the next page
    const cursor = response.next?.cursor
    if (cursor) {
      endpoint = buildProfileEndpoint(cursor)
    } else {
      break
    }
  }

  return allProfiles as Profile[]
}

/**
 * Helper function to build the profile endpoint with a cursor
 * @param cursor
 */
function buildProfileEndpoint(cursor?: string): string {
  return `https://api.farcaster.xyz/v2/recent-users?limit=1000${
    cursor ? `&cursor=${cursor}` : ''
  }`
}

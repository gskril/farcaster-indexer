import got from 'got'

import { MERKLE_REQUEST_OPTIONS } from '../merkle.js'
import supabase from '../supabase.js'
import { MerkleResponse, Profile, FollowerObject } from '../types/index'
import { breakIntoChunks } from '../utils.js'

/**
 * Reformat and upsert all profile of followers into the database
 */
export async function updateAllFollowers() {
  const startTime = Date.now()
  const allProfiles = await indexFollowers()

  const formattedProfiles = formatProfiles(allProfiles)

  // Upsert profiles followers in chunks to avoid locking the table
  const chunks = breakIntoChunks(formattedProfiles, 500)
  for (const chunk of chunks) {
    const { error } = await supabase
      .from('followers')
      .upsert(chunk, { onConflict: 'id' })

    if (error) {
      throw error
    }
  }

  const endTime = Date.now()
  const duration = (endTime - startTime) / 1000

  if (duration > 60) {
    console.log(`Updated profiles in ${duration} seconds`)
  }
}

/**
 * Index all followers of Farcaster users
 * @returns An array of all Farcaster profiles
 */
export async function indexFollowers() {
  const itemsPerRequest = 1000
  const profiles: { id: number }[] = new Array()

  // Get all profiles from the database, 1000 at a time (default Supabase setting)
  while (true) {
    const { data, error } = await supabase
      .from('profile')
      .select('id')
      .range(profiles.length, profiles.length + itemsPerRequest)

    if (error) {
      throw error
    }

    profiles.push(...data)

    if (data.length < itemsPerRequest) {
      break
    }
  }
  const allFollowers: FollowerObject = {}

  for (const profile of profiles) {
    const userFollowers: Profile[] = new Array() // Individual Users
    let endpoint = buildProfileEndpoint(profile.id)
    while (true) {
      const _response = await got(endpoint, MERKLE_REQUEST_OPTIONS).json()

      const response = _response as MerkleResponse
      const profiles = response.result.users

      if (!profiles) throw new Error('No profiles found')

      for (const profile of profiles) {
        userFollowers.push(profile)
      }

      // If there are more profiles, get the next page
      const cursor = response.next?.cursor
      if (cursor) {
        endpoint = buildProfileEndpoint(profile.id, cursor)
      } else {
        break
      }
    }

    // Add the user's followers to the allFollowers object
    allFollowers[profile.id] = userFollowers
  }
  return allFollowers
}

function buildProfileEndpoint(profile: number, cursor?: string): string {
  return `https://api.warpcast.com/v2/followers?fid=${profile}${
    cursor ? `&cursor=${cursor}` : ''
  }`
}

function formatProfiles(allProfiles: any) {
  const formattedProfiles: any[] = new Array()
  for (const profileIndex in allProfiles) {
    const followers = allProfiles[parseInt(profileIndex)]
    const followersList = followers.map((f: any) => f.fid)
    formattedProfiles.push({
      id: profileIndex,
      followers: followersList,
    })
  }
  return formattedProfiles
}

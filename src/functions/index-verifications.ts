import got from 'got'

import { MERKLE_REQUEST_OPTIONS } from '../merkle.js'
import supabase from '../supabase.js'
import {
  MerkleResponse,
  Verification,
  FlattenedVerification,
  Profile,
  FlattenedProfile,
} from '../types/index'

/**
 * Index all verifications (connected addresses) by Farcaster users.
 * Takes ~20 minutes to run.
 */
export async function indexVerifications() {
  const itemsPerRequest = 10_000
  const startTime = Date.now()
  const allProfiles: { id: number }[] = new Array()
  const filteredProfiles: { id: number }[] = new Array()

  // Get all profiles from the database, 1000 at a time (default Supabase setting)
  while (true) {
    console.log('looping over profiles')

    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .range(allProfiles.length, allProfiles.length + itemsPerRequest)

    if (error) {
      throw error
    }

    const profiles = data as FlattenedProfile[]

    // remove profiles that have null for all of the properties: username, display_name, avatar_url, followers, following, bio
    // this is to avoid wasting resources on spam profiles
    const profilesWithData = profiles.filter(
      (p) =>
        p.username ||
        p.display_name ||
        p.avatar_url ||
        p.followers ||
        p.following ||
        p.bio
    )

    allProfiles.push(...profiles)
    filteredProfiles.push(...profilesWithData)

    if (profiles.length < itemsPerRequest) {
      break
    }
  }

  let verificationCount = 0
  const verifications: Verification[] = new Array()
  console.log(`Getting verifications for ${filteredProfiles.length} profiles`)

  for (const profile of filteredProfiles) {
    const url = `https://api.warpcast.com/v2/verifications?fid=${profile.id}`
    const _res = await got(url, MERKLE_REQUEST_OPTIONS)
      .json()
      .catch((err) => {
        throw err
      })

    const res = _res as MerkleResponse

    if (res.result.verifications) {
      verificationCount += res.result.verifications.length
      verifications.push(...res.result.verifications)
    }

    // Save to Supabase and reset array on every 200th profile
    if (profile.id % 200 === 0) {
      const formattedVerifications = formatVerifications(verifications)
      const { error } = await supabase
        .from('verification')
        .upsert(formattedVerifications)

      if (error) {
        throw error
      }

      verifications.length = 0
    }
  }

  // Upsert the remaining verifications
  const formattedVerifications = formatVerifications(verifications)

  const { error } = await supabase
    .from('verification')
    .upsert(formattedVerifications)

  if (error) {
    throw error
  }

  const endTime = Date.now()
  const timeElapsed = (endTime - startTime) / 1000

  console.log(
    `Upserted ${verificationCount} verifications in ${timeElapsed} seconds`
  )
}

/**
 * Flatten a set of verifications
 * @param verifications Array of verifications
 * @returns Flattened verifications
 */
function formatVerifications(
  verifications: Verification[]
): FlattenedVerification[] {
  const formattedVerifications: FlattenedVerification[] = new Array()

  for (const v of verifications) {
    formattedVerifications.push({
      fid: v.fid,
      address: v.address,
      created_at: new Date(v.timestamp),
    })
  }

  return formattedVerifications
}

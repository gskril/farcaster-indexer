import got from 'got'

import { MERKLE_REQUEST_OPTIONS } from '../merkle.js'
import supabase from '../supabase.js'
import {
  MerkleResponse,
  Verification,
  FlattenedVerification,
} from '../types/index'

/**
 * Index all verifications (connected addresses) by Farcaster users.
 * Takes ~20 minutes to run.
 */
export async function indexVerifications() {
  const startTime = Date.now()
  const { data: profiles, error: supabaseError } = await supabase
    .from('profile')
    .select('id', { count: 'exact' })

  if (supabaseError) {
    throw supabaseError
  }

  const verifications: Verification[] = new Array()

  for (const profile of profiles) {
    const url = `https://api.farcaster.xyz/v2/verifications?fid=${profile.id}`
    const _res = await got(url, MERKLE_REQUEST_OPTIONS)
      .json()
      .catch((err) => {
        throw err
      })

    const res = _res as MerkleResponse

    if (res.result.verifications) {
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

  console.log(`Upserted all verifications in ${timeElapsed} seconds`)
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

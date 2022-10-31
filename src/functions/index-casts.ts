import { breakIntoChunks, cleanUserActivity } from '../utils.js'
import { castsTable, profilesTable } from '../index.js'
import got from 'got'
import supabase from '../supabase.js'

import { Cast, FlattenedCast, FlattenedProfile } from '../types/index'

/**
 * Index the casts from all Farcaster profiles and insert them into Supabase
 */
export async function indexAllCasts() {
  const startTime = Date.now()
  const { data: _profiles, error: profilesError } = await supabase
    .from(profilesTable)
    .select('*')
    .order('id', { ascending: true })

  if (!_profiles || _profiles.length === 0 || profilesError) {
    throw new Error('No profiles found.')
  }

  console.log(`Indexing casts from ${_profiles.length} profiles...`)
  const profiles: FlattenedProfile[] = _profiles
  const allCasts: FlattenedCast[] = []
  let profilesIndexed = 0

  for (const profile of profiles) {
    const _activity = await getProfileActivity(profile)

    if (!_activity || _activity.length === 0) continue
    const activity: Cast[] = cleanUserActivity(_activity)

    activity.map((cast: Cast) => {
      // don't save recasts
      if (cast.meta?.recast) return

      allCasts.push({
        type: 'text-short',
        published_at: new Date(cast.body.publishedAt),
        sequence: cast.body.sequence,
        address: cast.body.address,
        username: cast.body.username,
        text: cast.body.data.text,
        reply_parent_merkle_root: cast.body.data.replyParentMerkleRoot || null,
        prev_merkle_root: cast.body.prevMerkleRoot || null,
        signature: cast.signature,
        merkle_root: cast.merkleRoot,
        thread_merkle_root: cast.threadMerkleRoot,
        display_name: cast.meta?.displayName || null,
        avatar_url: cast.meta?.avatar || null,
        avatar_verified: cast.meta?.isVerifiedAvatar || false,
        mentions: cast.meta?.mentions || [],
        num_reply_children: cast.meta?.numReplyChildren || null,
        reply_parent_username: cast.meta?.replyParentUsername?.username || null,
        reply_parent_address: cast.meta?.replyParentUsername?.address || null,
        reactions: cast.meta?.reactions?.count || null,
        recasts: cast.meta?.recasts?.count || null,
        watches: cast.meta?.watches?.count || null,
        recasters: cast.meta?.recasters || [],
        deleted: cast.body.data.text.startsWith('delete:farcaster://')
          ? true
          : false,
      })
    })

    profilesIndexed++
  }

  // Break allCasts into chunks of 1000
  const chunks = breakIntoChunks(allCasts, 1000)

  // Upsert each chunk into the Supabase table
  for (const chunk of chunks) {
    const { error } = await supabase.from(castsTable).upsert(chunk, {
      onConflict: 'merkle_root',
    })

    if (error) {
      console.error(error)

      // check if any two casts have the same merkle root
      const merkleRoots = chunk.map((cast: FlattenedCast) => cast.merkle_root)
      const uniqueMerkleRoots = [...new Set(merkleRoots)]
      if (merkleRoots.length !== uniqueMerkleRoots.length) {
        console.error('Duplicate merkle roots found in chunk')
        // find which merkle roots are duplicated and who posted them
        const duplicates = merkleRoots.filter(
          (merkleRoot: string, index: number) =>
            merkleRoots.indexOf(merkleRoot) !== index &&
            merkleRoots.indexOf(merkleRoot) < index
        )
        console.error(duplicates)

        // find the address of the profiles who have a cast with a merkle root from the duplicates array
        const duplicateAddresses = chunk
          .filter((cast: FlattenedCast) =>
            duplicates.includes(cast.merkle_root)
          )
          .map((cast: FlattenedCast) => cast.address)
        console.error(duplicateAddresses)
      }

      return
    }
  }

  const endTime = Date.now()
  const secondsTaken = (endTime - startTime) / 1000
  console.log(
    `Saved ${allCasts.length} casts from ${profilesIndexed} profiles in ${secondsTaken} seconds`
  )
}

/**
 * Iterate through all the pages of a profile's activity and return the full activity
 * @param profile Flattened Farcaster profile from Supabase
 * @returns Array of all casts by a user
 */
async function getProfileActivity(profile: FlattenedProfile): Promise<Cast[]> {
  if (!profile.username) {
    console.log(`No username found for profile with id ${profile.id}`)
    return []
  }

  const _activity = await got(
    `https://guardian.farcaster.xyz/origin/address_activity/${profile.address}`
  )
    .json()
    .catch((err) => {
      console.error(`Could not get activity for @${profile.username}`, err)
      return []
    })

  const activity = _activity as Cast[]
  return activity
}

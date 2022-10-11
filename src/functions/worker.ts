import { Cast, FlattenedCast, FlattenedProfile } from '../types/index'
import got from 'got'
import supabase from '../supabase.js'
import { castsTable } from '../index.js'
import { expose } from 'threads/worker'

expose({
  async saveCastsForChunk(chunk: FlattenedProfile[]) {
    for (const profile of chunk) {
      const _activity = await getProfileActivity(profile)

      if (!_activity) continue
      const activity: Cast[] = _activity
      const userCasts: FlattenedCast[] = []

      activity.map((cast: Cast) => {
        userCasts.push({
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
          deleted: cast.body.data.text.startsWith('delete:farcaster://') ? true : false,
          recast: cast.body.data.text.startsWith('recast:') ? true : false,
        })
      })

      const { error } = await supabase.from(castsTable).upsert(userCasts, {
        onConflict: 'merkle_root',
      })

      if (error) {
        console.error(error)

        // check if any two casts have the same merkle root
        const merkleRoots = userCasts.map((cast: FlattenedCast) => cast.merkle_root)
        const uniqueMerkleRoots = [...new Set(merkleRoots)]
        if (merkleRoots.length !== uniqueMerkleRoots.length) {
          console.error('Duplicate merkle roots found in chunk')
          // find which merkle roots are duplicated and who posted them
          const duplicates = merkleRoots.filter(
            (merkleRoot: string, index: number) =>
              merkleRoots.indexOf(merkleRoot) !== index && merkleRoots.indexOf(merkleRoot) < index,
          )
          console.error(duplicates)

          // find the address of the profiles who have a cast with a merkle root from the duplicates array
          const duplicateAddresses = userCasts
            .filter((cast: FlattenedCast) => duplicates.includes(cast.merkle_root))
            .map((cast: FlattenedCast) => cast.address)
          console.error(duplicateAddresses)
        }

        return
      }

      console.log(`Saved ${userCasts.length} casts from ${profile.username}`)
    }

    console.log('Finished saving casts for chunk')

    return
  },
})

/**
 * Iterate through all the pages of a profile's activity and return the full activity
 * @param profile Flattened Farcaster profile from Supabase
 * @returns Array of all casts by a user
 */
async function getProfileActivity(profile: FlattenedProfile): Promise<Cast[]> {
  const _activity = await got(
    `https://guardian.farcaster.xyz/origin/address_activity/${profile.address}`,
  )
    .json()
    .catch(err => {
      console.error(`Could not get activity for @${profile.username}`, err)
      return []
    })

  const activity = _activity as Cast[]
  return activity
}

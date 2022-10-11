import { Cast, FlattenedCast, FlattenedProfile } from '../types/index'
import got from 'got'
import supabase from '../supabase.js'
import { castsTable } from '../index.js'
import { expose } from 'threads/worker'
import flattenCast from '../utils/flattenCast.js'

expose({
  async saveCastsForChunk(chunk: FlattenedProfile[]) {
    for (const profile of chunk) {
      const _activity = await getProfileActivity(profile)

      if (!_activity) continue
      const activity: Cast[] = _activity
      const userCasts: FlattenedCast[] = []

      activity.map((cast: Cast) => {
        userCasts.push(flattenCast(cast))
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

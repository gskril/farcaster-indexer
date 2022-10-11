import { breakIntoChunks } from '../utils.js'
import { castsTable, profilesTable } from '../index.js'
import got from 'got'
import supabase from '../supabase.js'
import { spawn, Thread, Worker } from 'threads'
import flattenCast from '../utils/flattenCast.js'

import { Cast, FlattenedCast, FlattenedProfile } from '../types/index'

/**
 * Index the casts from all Farcaster profiles and insert them into Supabase
 */
export async function indexAllCasts() {
  const startTime = Date.now()

  // Get all profiles
  const { data: _profiles, error: profilesError } = await supabase
    .from(profilesTable)
    .select('*')
    .order('id', { ascending: true })

  if (!_profiles || _profiles.length === 0 || profilesError) {
    throw new Error('No profiles found.')
  }

  console.log(`Indexing casts from ${_profiles.length} profiles...`)
  const profiles: FlattenedProfile[] = _profiles

  const chunks = breakIntoChunks(profiles, 500)
  const worker = await spawn(new Worker('./worker'))

  console.log(`There are ${chunks.length} chunks to process`)

  // Process each chunk independently
  await Promise.all(chunks.map(chunk => worker.saveCastsForChunk(chunk)))

  // Terminate all threads
  await Thread.terminate(worker)

  const endTime = Date.now()
  const secondsTaken = (endTime - startTime) / 1000

  console.log(`Finished in ${secondsTaken} seconds`)
}

export async function indexAllCastsForUser(address: string) {
  const _activity = await got(
    `https://guardian.farcaster.xyz/origin/address_activity/${address}`,
  ).json()

  const activity = _activity as Cast[]
  const allCasts: FlattenedCast[] = []

  activity.map((cast: Cast) => {
    // don't save recasts
    if (cast.meta?.recast) return

    allCasts.push(flattenCast(cast))
  })

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
            merkleRoots.indexOf(merkleRoot) !== index && merkleRoots.indexOf(merkleRoot) < index,
        )
        console.error(duplicates)

        // find the address of the profiles who have a cast with a merkle root from the duplicates array
        const duplicateAddresses = chunk
          .filter((cast: FlattenedCast) => duplicates.includes(cast.merkle_root))
          .map((cast: FlattenedCast) => cast.address)
        console.error(duplicateAddresses)
      }

      return
    }
  }

  console.log(`Saved ${allCasts.length} casts from ${address} profiles`)
}

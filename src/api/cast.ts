import { fromFarcasterTime } from '@farcaster/utils'

import { formatHash } from '../lib.js'
import supabase from '../supabase.js'
import { MergeMessageHubEvent } from '../types'
import { Cast } from '../types/db'

/**
 * Insert a new cast in the database
 * @param msg Hub event in JSON format
 */
export async function insertCast(msg: MergeMessageHubEvent) {
  const hash = formatHash(msg.hash)
  const parentHash = msg.data.castAddBody!.parentCastId?.hash
  const timestamp = fromFarcasterTime(msg.data.timestamp)._unsafeUnwrap()

  const cast: Cast = {
    hash,
    signature: formatHash(msg.signature),
    signer: formatHash(msg.signer),
    text: msg.data.castAddBody!.text,
    fid: msg.data.fid,
    mentions: msg.data.castAddBody!.mentions,
    parent_fid: msg.data.castAddBody!.parentCastId?.fid,
    parent_hash: parentHash ? formatHash(parentHash) : null,
    thread_hash: null,
    published_at: new Date(timestamp),
  }

  const insert = await supabase.from('casts').insert(cast)

  if (insert.error) {
    console.error('ERROR INSERTING CAST', insert.error)
  } else {
    console.log(`CAST INSERTED -- ${hash} by ${msg.data.fid}`)
  }
}

/**
 * Upsert a list of casts in the database
 * @param casts List of casts
 */
export async function upsertCasts(casts: Cast[]) {
  if (casts.length === 0) return

  const { error } = await supabase.from('casts').upsert(casts, {
    onConflict: 'hash',
    ignoreDuplicates: true,
  })

  if (error) {
    console.error('ERROR UPSERTING CASTS', error)
  } else {
    console.log('CASTS UPSERTED', casts.length)
  }
}

/**
 * Update a cast in the database
 * @param hash Hash of the cast
 * @param change Object with the fields to update
 */
export async function updateCast(
  _hash: string,
  change: { deleted?: boolean; pruned?: boolean }
) {
  const hash = formatHash(_hash)
  const update = await supabase.from('casts').update(change).eq('hash', hash)

  if (update.error) {
    console.error('ERROR UPDATING CAST', update.error)
  } else {
    console.log('CAST UPDATED', hash)
  }
}

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
  })

  if (error) {
    console.error('ERROR UPSERTING CASTS', error)
  } else {
    console.log('CASTS UPSERTED', casts.length)
  }
}

/**
 * Soft delete a cast from the database
 * @param msg Hub event in JSON format
 */
export async function deleteCast(msg: MergeMessageHubEvent) {
  const hash = formatHash(msg.data.castRemoveBody!.targetHash)

  const update = await supabase
    .from('casts')
    .update({ deleted: true })
    .eq('hash', hash)

  if (update.error) {
    console.error('ERROR UPDATING CAST', update.error)
  } else {
    console.log('CAST UPDATED', hash)
  }
}

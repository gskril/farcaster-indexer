import { fromFarcasterTime } from '@farcaster/utils'

import { formatHash } from '../lib.js'
import supabase from '../supabase.js'
import { MergeMessageHubEvent } from '../types'
import { Cast } from '../types/db'

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
    console.log('ERROR INSERTING CAST', insert.error)
  } else {
    console.log('CAST INSERTED', hash)
  }
}

export async function deleteCast(msg: MergeMessageHubEvent) {
  const hash = formatHash(msg.data.castRemoveBody!.targetHash)

  const update = await supabase
    .from('casts')
    .update({ deleted: true })
    .eq('hash', hash)

  if (update.error) {
    console.log('ERROR UPDATING CAST', update.error)
  } else {
    console.log('CAST UPDATED', hash)
  }
}

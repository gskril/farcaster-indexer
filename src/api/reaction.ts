import { formatHash } from '../lib.js'
import supabase from '../supabase.js'
import { MergeMessageHubEvent } from '../types'
import { Reaction } from '../types/db'

/**
 * Insert a reaction in the database
 * @param msg Hub event in JSON format
 */
export async function insertReaction(msg: MergeMessageHubEvent) {
  const fid = msg.data.fid

  const reaction: Reaction = {
    fid,
    target_cast: formatHash(msg.data.reactionBody!.targetCastId.hash),
    target_fid: msg.data.reactionBody!.targetCastId.fid,
    type: msg.data.reactionBody!.type.toString(),
  }

  const insert = await supabase.from('reaction').insert(reaction)

  if (insert.error) {
    console.log('ERROR INSERTING REACTION', insert.error)
  } else {
    console.log('REACTION INSERTED', fid)
  }
}

/**
 * Delete a reaction from the database
 * @param msg Hub event in JSON format
 */
export async function deleteReaction(msg: MergeMessageHubEvent) {
  const fid = msg.data.fid

  const drop = await supabase
    .from('reaction')
    .delete()
    .eq('fid', fid)
    .eq('target_cast', formatHash(msg.data.reactionBody!.targetCastId.hash))

  if (drop.error) {
    console.log('ERROR DELETING REACTION', drop.error)
  } else {
    console.log('REACTION DELETED', fid)
  }
}

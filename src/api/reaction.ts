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
    signer: formatHash(msg.signer),
  }

  const insert = await supabase.from('reaction').insert(reaction)

  if (insert.error) {
    console.error('ERROR INSERTING REACTION', insert.error)
  } else {
    console.log('REACTION INSERTED', fid)
  }
}

/**
 * Upsert a list of reactions in the database
 * @param reactions List of reactions
 */
export async function upsertReactions(reactions: Reaction[]) {
  if (reactions.length === 0) return

  const { error } = await supabase.from('reaction').upsert(reactions, {
    onConflict: 'fid,target_cast',
  })

  if (error) {
    console.error('ERROR UPSERTING REACTIONS', error)
  } else {
    console.log('REACTIONS UPSERTED', reactions.length)
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
    console.error('ERROR DELETING REACTION', drop.error)
  } else {
    console.log('REACTION DELETED', fid)
  }
}

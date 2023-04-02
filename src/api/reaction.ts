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
  const target_cast = formatHash(msg.data.reactionBody!.targetCastId.hash)

  const reaction: Reaction = {
    fid,
    target_cast,
    target_fid: msg.data.reactionBody!.targetCastId.fid,
    type: msg.data.reactionBody!.type.toString(),
    signer: formatHash(msg.signer),
  }

  const insert = await supabase.from('reaction').insert(reaction)

  if (insert.error) {
    console.error('ERROR INSERTING REACTION', insert.error)
  } else {
    console.log(`REACTION INSERTED -- ${fid} to ${target_cast}`)
  }
}

/**
 * Upsert a list of reactions in the database
 * @param reactions List of reactions
 */
export async function upsertReactions(reactions: Reaction[]) {
  if (reactions.length === 0) return

  // TODO: fix rare error here: "ON CONFLICT DO UPDATE command cannot affect row a second time"
  const { error } = await supabase.from('reaction').upsert(reactions, {
    onConflict: 'fid,target_cast,type',
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
  const targetCastHash = formatHash(msg.data.reactionBody!.targetCastId.hash)

  const drop = await supabase
    .from('reaction')
    .delete()
    .eq('fid', fid)
    .eq('target_cast', targetCastHash)

  if (drop.error) {
    console.error('ERROR DELETING REACTION', drop.error)
  } else {
    console.log(`REACTION DELETED -- ${fid} to ${targetCastHash}`)
  }
}

/**
 * Update a reaction in the database
 * @param msg Hub event in JSON format
 * @param change Object with the fields to update
 */
export async function updateReaction(
  msg: MergeMessageHubEvent,
  change: { pruned: boolean }
) {
  const fid = msg.data.fid
  const targetCastHash = formatHash(msg.data.reactionBody!.targetCastId.hash)

  const update = await supabase
    .from('reaction')
    .update(change)
    .eq('fid', fid)
    .eq('target_cast', targetCastHash)

  if (update.error) {
    console.error('ERROR UPDATING REACTION', update.error)
  } else {
    console.log(`REACTION UPDATED -- ${fid} to ${targetCastHash}`)
  }
}

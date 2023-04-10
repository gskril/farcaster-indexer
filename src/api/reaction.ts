import { db } from '../db.js'
import { formatHash } from '../lib.js'
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

  try {
    await db
      .insertInto('reaction')
      .values(reaction)
      .onConflict((oc) =>
        oc.columns(['fid', 'target_cast', 'type']).doNothing()
      )
      .executeTakeFirstOrThrow()
    console.log(`REACTION INSERTED -- ${fid} to ${target_cast}`)
  } catch (error) {
    console.error('ERROR INSERTING REACTION', error)
  }
}

/**
 * Upsert a list of reactions in the database
 * @param reactions List of reactions
 */
export async function upsertReactions(reactions: Reaction[]) {
  if (reactions.length === 0) return

  try {
    await db
      .insertInto('reaction')
      .values(reactions)
      .onConflict((oc) =>
        oc.columns(['fid', 'target_cast', 'type']).doNothing()
      )
      .executeTakeFirstOrThrow()

    console.log('REACTIONS UPSERTED', reactions.length)
  } catch (error) {
    console.error('ERROR UPSERTING REACTIONS', error)
  }
}

/**
 * Delete a reaction from the database
 * @param msg Hub event in JSON format
 */
export async function deleteReaction(msg: MergeMessageHubEvent) {
  const fid = msg.data.fid
  const targetCastHash = formatHash(msg.data.reactionBody!.targetCastId.hash)

  try {
    await db
      .deleteFrom('reaction')
      .where('fid', '=', fid)
      .where('target_cast', '=', targetCastHash)
      .executeTakeFirstOrThrow()

    console.log(`REACTION DELETED -- ${fid} to ${targetCastHash}`)
  } catch (error) {
    console.error('ERROR DELETING REACTION', error)
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

  try {
    await db
      .updateTable('reaction')
      .set(change)
      .where('fid', '=', fid)
      .where('target_cast', '=', targetCastHash)
      .executeTakeFirstOrThrow()

    console.log(`REACTION UPDATED -- ${fid} to ${targetCastHash}`)
  } catch (error) {
    console.error('ERROR UPDATING REACTION', error)
  }
}

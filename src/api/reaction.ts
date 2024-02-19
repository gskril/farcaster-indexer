import { Message, fromFarcasterTime } from '@farcaster/hub-nodejs'

import { db } from '../db/kysely.js'
import { formatReactions } from '../lib/utils.js'

/**
 * Insert a reaction in the database
 * @param msg Hub event in JSON format
 */
export async function insertReactions(msgs: Message[]) {
  const reactions = formatReactions(msgs)

  try {
    await db
      .insertInto('reactions')
      .values(reactions)
      .onConflict((oc) => oc.column('hash').doNothing())
      .execute()

    console.log(`REACTIONS INSERTED`)
  } catch (error) {
    console.error('ERROR INSERTING REACTIONS', error)
  }
}

export async function deleteReaction(msg: Message) {
  const data = msg.data!
  const reaction = data.reactionBody!

  try {
    if (reaction.targetCastId) {
      await db
        .updateTable('reactions')
        .set({
          deletedAt: new Date(
            fromFarcasterTime(data.timestamp)._unsafeUnwrap()
          ),
        })
        .where('fid', '=', data.fid)
        .where('type', '=', reaction.type)
        .where('targetCastHash', '=', reaction.targetCastId.hash)
        .execute()
    } else if (reaction.targetUrl) {
      await db
        .updateTable('reactions')
        .set({
          deletedAt: new Date(
            fromFarcasterTime(data.timestamp)._unsafeUnwrap()
          ),
        })
        .where('fid', '=', data.fid)
        .where('type', '=', reaction.type)
        .where('targetUrl', '=', reaction.targetUrl)
        .execute()
    }

    console.log(
      `REACTION DELETED`,
      data.fid,
      reaction.targetCastId?.fid || reaction.targetUrl
    )
  } catch (error) {
    console.error('ERROR DELETING REACTION', error)
  }
}

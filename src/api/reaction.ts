import { Message } from '@farcaster/hub-nodejs'

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

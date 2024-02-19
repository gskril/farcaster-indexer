import { Message, fromFarcasterTime } from '@farcaster/hub-nodejs'

import { db } from '../db/kysely.js'
import { formatCasts } from '../lib/utils.js'

/**
 * Insert casts in the database
 * @param msg Hub event in JSON format
 */
export async function insertCasts(msgs: Message[]) {
  const casts = formatCasts(msgs)

  try {
    await db
      .insertInto('casts')
      .values(casts)
      .onConflict((oc) => oc.column('hash').doNothing())
      .execute()

    console.log(`CASTS INSERTED`)
  } catch (error) {
    console.error('ERROR INSERTING CAST', error)
  }
}

/**
 * Update a cast in the database
 * @param hash Hash of the cast
 * @param change Object with the fields to update
 */
export async function deleteCasts(msgs: Message[]) {
  try {
    await db.transaction().execute(async (trx) => {
      for (const msg of msgs) {
        const data = msg.data!

        await trx
          .updateTable('casts')
          .set({
            deletedAt: new Date(
              fromFarcasterTime(data.timestamp)._unsafeUnwrap()
            ),
          })
          .where('hash', '=', data.castRemoveBody?.targetHash!)
          .execute()
      }
    })

    console.log(`CASTS DELETED`)
  } catch (error) {
    console.error('ERROR DELETING CAST', error)
  }
}

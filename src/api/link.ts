import { Message, fromFarcasterTime } from '@farcaster/hub-nodejs'

import { db } from '../db/kysely.js'
import { formatLinks } from '../lib/utils.js'

export async function insertLinks(msgs: Message[]) {
  const links = formatLinks(msgs)

  try {
    await db
      .insertInto('links')
      .values(links)
      .onConflict((oc) => oc.column('hash').doNothing())
      .execute()

    console.log(`LINKS INSERTED`)
  } catch (error) {
    console.error('ERROR INSERTING LINK', error)
  }
}

export async function deleteLinks(msgs: Message[]) {
  try {
    await db.transaction().execute(async (trx) => {
      for (const msg of msgs) {
        const data = msg.data!

        await trx
          .updateTable('links')
          .set({
            deletedAt: new Date(
              fromFarcasterTime(data.timestamp)._unsafeUnwrap()
            ),
          })
          .where('fid', '=', data.fid)
          .where('targetFid', '=', data.linkBody!.targetFid!)
          .execute()
      }
    })

    console.log(`LINKS DELETED`)
  } catch (error) {
    console.error('ERROR DELETING LINK', error)
  }
}

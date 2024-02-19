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

    console.log(`LINK INSERTED`)
  } catch (error) {
    console.error('ERROR INSERTING LINK', error)
  }
}

export async function deleteLink(msg: Message) {
  const data = msg.data!

  try {
    await db
      .updateTable('links')
      .set({
        deletedAt: new Date(fromFarcasterTime(data.timestamp)._unsafeUnwrap()),
      })
      .where('fid', '=', data.fid)
      .where('targetFid', '=', data.linkBody!.targetFid!)
      .execute()

    console.log(`LINK DELETED`, data.fid, data.linkBody!.targetFid)
  } catch (error) {
    console.error('ERROR DELETING LINK', error)
  }
}

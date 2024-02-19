import { Message, fromFarcasterTime } from '@farcaster/hub-nodejs'

import { db } from '../db/kysely.js'
import { formatVerifications } from '../lib/utils.js'

/**
 * Insert a new verification in the database
 * @param msg Hub event in JSON format
 */
export async function insertVerifications(msgs: Message[]) {
  const verifications = formatVerifications(msgs)

  try {
    await db
      .insertInto('verifications')
      .values(verifications)
      .onConflict((oc) => oc.columns(['fid', 'signerAddress']).doNothing())
      .execute()

    console.log(`VERIFICATIONS INSERTED`)
  } catch (error) {
    console.error('ERROR INSERTING VERIFICATION', error)
  }
}

/**
 * Delete a verification from the database
 * @param msg Hub event in JSON format
 */
export async function deleteVerification(msg: Message) {
  const data = msg.data!
  const address = data.verificationRemoveBody!.address

  try {
    await db
      .updateTable('verifications')
      .set({
        deletedAt: new Date(fromFarcasterTime(data.timestamp)._unsafeUnwrap()),
      })
      .where('signerAddress', '=', address)
      .where('fid', '=', data.fid)
      .execute()

    console.log('VERIFICATION DELETED', data.fid)
  } catch (error) {
    console.error('ERROR DELETING VERIFICATION', error)
  }
}

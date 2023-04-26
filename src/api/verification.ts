import { fromFarcasterTime } from '@farcaster/utils'

import { db } from '../db.js'
import { formatHash } from '../lib.js'
import { MergeMessageHubEvent } from '../types'
import { Verification } from '../types/db'

/**
 * Insert a new verification in the database
 * @param msg Hub event in JSON format
 */
export async function insertVerification(msg: MergeMessageHubEvent) {
  const fid = msg.data.fid
  const address = formatHash(msg.data.verificationAddEthAddressBody!.address)
  const timestamp = fromFarcasterTime(msg.data.timestamp)._unsafeUnwrap()

  const verification: Verification = {
    fid,
    address,
    signature: formatHash(msg.data.verificationAddEthAddressBody!.ethSignature),
    signer: formatHash(msg.signer),
    created_at: new Date(timestamp),
  }

  try {
    await db
      .insertInto('verification')
      .values(verification)
      .onConflict((oc) => oc.columns(['fid', 'address']).doNothing())
      .executeTakeFirstOrThrow()

    console.log(`VERIFICATION INSERTED -- ${address} by ${fid}`)
  } catch (error) {
    console.error('ERROR INSERTING VERIFICATION', error)
  }
}

/**
 * Upsert a list of verifications in the database
 * @param verifications List of verifications
 */
export async function upsertVerifications(verifications: Verification[]) {
  if (verifications.length === 0) return

  try {
    await db
      .insertInto('verification')
      .values(verifications)
      .onConflict((oc) => oc.columns(['fid', 'address']).doNothing())
      .executeTakeFirstOrThrow()

    console.log('VERIFICATIONS UPSERTED', verifications.length)
  } catch (error) {
    console.error('ERROR UPSERTING VERIFICATIONS', error)
  }
}

/**
 * Delete a verification from the database
 * @param msg Hub event in JSON format
 */
export async function deleteVerification(msg: MergeMessageHubEvent) {
  const fid = msg.data.fid
  const address = formatHash(msg.data.verificationRemoveBody!.address)

  try {
    await db
      .deleteFrom('verification')
      .where('fid', '=', fid)
      .where('address', '=', address)
      .executeTakeFirstOrThrow()

    console.log('VERIFICATION DELETED', fid, address)
  } catch (error) {
    console.error('ERROR DELETING VERIFICATION', error)
  }
}

/**
 * Update a verification in the database
 * @param msg Hub event in JSON format
 * @param change Object with the fields to update
 */
export async function updateVerification(
  msg: MergeMessageHubEvent,
  change: { pruned: boolean }
) {
  const fid = msg.data.fid
  const address = formatHash(msg.data.verificationAddEthAddressBody!.address)

  try {
    await db
      .updateTable('verification')
      .set(change)
      .where('fid', '=', fid)
      .where('address', '=', address)
      .executeTakeFirstOrThrow()

    console.log(`VERIFICATION UPDATED -- $${address}`)
  } catch (error) {
    console.error('ERROR UPDATING VERIFICATION', error)
  }
}

import { db } from '../db.js'
import { formatHash } from '../lib.js'
import { MergeMessageHubEvent } from '../types'
import { Signer } from '../types/db'

/**
 * Insert a new signer in the database
 * @param msg Hub event in JSON format
 */
export async function insertSigner(msg: MergeMessageHubEvent) {
  const fid = msg.data.fid
  const name = msg.data.signerAddBody!.name

  const signer: Signer = {
    fid,
    signer: formatHash(msg.data.signerAddBody!.signer),
    name,
  }

  try {
    await db
      .insertInto('signer')
      .values(signer)
      .onConflict((oc) => oc.columns(['fid', 'signer']).doNothing())
      .executeTakeFirstOrThrow()

    console.log(`SIGNER INSERTED -- "${name || 'untitled'}" by ${fid}`)
  } catch (error) {
    console.error('ERROR INSERTING SIGNER', error)
  }
}

/**
 * Upsert a list of signers in the database
 * @param signers List of signers
 */
export async function upsertSigners(signers: Signer[]) {
  if (signers.length === 0) return

  try {
    await db
      .insertInto('signer')
      .values(signers)
      .onConflict((oc) => oc.columns(['fid', 'signer']).doNothing())
      .executeTakeFirstOrThrow()

    console.log('SIGNERS UPSERTED', signers.length)
  } catch (error) {
    console.error('ERROR UPSERTING SIGNERS', error)
  }
}

/**
 * Delete a signer from the database
 * @param msg Hub event in JSON format
 */
export async function deleteSigner(msg: MergeMessageHubEvent) {
  const fid = msg.data.fid

  try {
    await db
      .deleteFrom('signer')
      .where('fid', '=', fid)
      .where('signer', '=', formatHash(msg.data.signerRemoveBody!.signer))
      .executeTakeFirstOrThrow()

    console.log(`SIGNER DELETED -- by ${fid}`)
  } catch (error) {
    console.error('ERROR DELETING SIGNER', error)
  }
}

/**
 * Delete all messages from a signer from the database
 * @param signer Signer to delete messages from
 */
export async function deleteMessagesFromSigner(signer: string) {
  // Delete casts
  try {
    await db
      .deleteFrom('casts')
      .where('signer', '=', signer)
      .executeTakeFirstOrThrow()

    console.log(`CASTS FROM REVOKED SIGNER DELETED -- ${signer}`)
  } catch (error) {
    console.error('ERROR DELETING CASTS WITH REVOKED SIGNER', error)
  }

  // Delete reactions
  try {
    await db
      .deleteFrom('reaction')
      .where('signer', '=', signer)
      .executeTakeFirstOrThrow()

    console.log(`REACTIONS FROM REVOKED SIGNER DELETED -- ${signer}`)
  } catch (error) {
    console.error('ERROR DELETING REACTIONS WITH REVOKED SIGNER', error)
  }

  // Delete verifications
  try {
    await db
      .deleteFrom('verification')
      .where('signer', '=', signer)
      .executeTakeFirstOrThrow()

    console.log(`VERIFICATIONS FROM REVOKED SIGNER DELETED -- ${signer}`)
  } catch (error) {
    console.error('ERROR DELETING VERIFICATIONS WITH REVOKED SIGNER', error)
  }
}

/**
 * Update a signer in the database
 * @param msg Hub event in JSON format
 * @param change Object with the fields to update
 */
export async function updateSigner(
  msg: MergeMessageHubEvent,
  change: { pruned: boolean }
) {
  const fid = msg.data.fid
  const signer = formatHash(msg.data.signerAddBody!.signer)

  try {
    await db
      .updateTable('signer')
      .set(change)
      .where('fid', '=', fid)
      .where('signer', '=', signer)
      .executeTakeFirstOrThrow()

    console.log(`SIGNER UPDATED -- $${signer} by ${fid}`)
  } catch (error) {
    console.error('ERROR UPDATING SIGNER', error)
  }
}

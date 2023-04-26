import { db } from '../db.js'
import { formatHash } from '../lib.js'
import { MergeMessageHubEvent } from '../types'
import { Cast } from '../types/db'
import { formatCasts } from '../utils.js'

/**
 * Insert a new cast in the database
 * @param msg Hub event in JSON format
 */
export async function insertCast(msg: MergeMessageHubEvent) {
  const hash = formatHash(msg.hash)
  const casts = formatCasts([msg])

  try {
    await db
      .insertInto('casts')
      .values(casts)
      .onConflict((oc) => oc.column('hash').doNothing())
      .executeTakeFirstOrThrow()
    console.log(`CAST INSERTED -- ${hash} by ${msg.data.fid}`)
  } catch (error) {
    console.error('ERROR INSERTING CAST', error)
  }
}

/**
 * Upsert a list of casts in the database
 * @param casts List of casts
 */
export async function upsertCasts(casts: Cast[]) {
  if (casts.length === 0) return

  try {
    await db
      .insertInto('casts')
      .values(casts)
      .onConflict((oc) => oc.column('hash').doNothing())
      .executeTakeFirstOrThrow()
    console.log('CASTS UPSERTED', casts.length)
  } catch (error) {
    console.error('ERROR UPSERTING CASTS', error)
  }
}

/**
 * Update a cast in the database
 * @param hash Hash of the cast
 * @param change Object with the fields to update
 */
export async function updateCast(
  _hash: string,
  change: { deleted?: boolean; pruned?: boolean }
) {
  const hash = formatHash(_hash)

  try {
    await db
      .updateTable('casts')
      .set(change)
      .where('hash', '=', hash)
      .executeTakeFirstOrThrow()
    console.log('CAST UPDATED', hash)
  } catch (error) {
    console.error('ERROR UPDATING CAST', error)
  }
}

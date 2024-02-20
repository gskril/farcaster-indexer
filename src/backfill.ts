import { FidRequest } from '@farcaster/hub-nodejs'
import 'dotenv/config'

import {
  castAddBatcher,
  linkAddBatcher,
  reactionAddBatcher,
  userDataAddBatcher,
  verificationAddBatcher,
} from './lib/batch.js'
import { client } from './lib/client.js'
import { idRegistry, opClient } from './lib/op.js'

/**
 * Backfill the database with data from a hub. This may take a while.
 */
export async function backfill() {
  console.log('Backfilling...')
  const startTime = new Date().getTime()
  const allFids = await getAllFids()
  console.log(allFids.length, 'accounts to backfill')

  for (const fid of allFids) {
    // Only index the first 10 accounts for testing
    // TODO: Remove this
    if (fid > 10) {
      break
    } else {
      console.log(fid)
    }

    const p = await getFullProfileFromHub(fid).catch((err) => {
      console.error(`Error getting profile for FID ${fid}`, err)
      return null
    })

    if (!p) continue

    p.casts.forEach((msg) => castAddBatcher.add(msg))
    p.links.forEach((msg) => linkAddBatcher.add(msg))
    p.reactions.forEach((msg) => reactionAddBatcher.add(msg))
    p.userData.forEach((msg) => userDataAddBatcher.add(msg))
    p.verifications.forEach((msg) => verificationAddBatcher.add(msg))
  }

  const endTime = new Date().getTime()
  const elapsedMilliseconds = endTime - startTime
  const elapsedMinutes = elapsedMilliseconds / 60000
  console.log(`Done backfilling in ${elapsedMinutes} minutes`)
}

/**
 * Index all messages from a profile
 * @param fid Farcaster ID
 */
async function getFullProfileFromHub(_fid: number) {
  const fid = FidRequest.create({ fid: _fid })

  // TODO: add pagination for all of these
  const casts = await client.getCastsByFid(fid)
  const links = await client.getLinksByFid(fid)
  const reactions = await client.getReactionsByFid(fid)
  const userData = await client.getUserDataByFid(fid)
  const verifications = await client.getVerificationsByFid(fid)

  return {
    casts: casts._unsafeUnwrap().messages,
    links: links._unsafeUnwrap().messages,
    reactions: reactions._unsafeUnwrap().messages,
    userData: userData._unsafeUnwrap().messages,
    verifications: verifications._unsafeUnwrap().messages,
  }
}

/**
 * Get all fids
 * @returns array of fids
 */
async function getAllFids() {
  const fidCount = await opClient.readContract({
    ...idRegistry,
    functionName: 'idCounter',
  })

  return Array.from({ length: Number(fidCount) }, (_, i) => i + 1)
}

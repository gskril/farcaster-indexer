import { FidRequest } from '@farcaster/hub-nodejs'
import { Presets, SingleBar } from 'cli-progress'
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

const progressBar = new SingleBar({}, Presets.shades_classic)

/**
 * Backfill the database with data from a hub. This may take a while.
 */
export async function backfill({ maxFid }: { maxFid: number | undefined }) {
  console.log('Backfilling...')
  const startTime = new Date().getTime()
  const allFids = await getAllFids()
  console.log(allFids.length, 'accounts to backfill')
  progressBar.start(maxFid || allFids.length, allFids[0])

  for (const fid of allFids) {
    if (maxFid && fid > maxFid) {
      console.log(`Reached max FID ${maxFid}, stopping backfill`)
      break
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

    progressBar.increment()
  }

  const endTime = new Date().getTime()
  const elapsedMilliseconds = endTime - startTime
  const elapsedMinutes = elapsedMilliseconds / 60000
  console.log(`Done backfilling in ${elapsedMinutes} minutes`)
  progressBar.stop()
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

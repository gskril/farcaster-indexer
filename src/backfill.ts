import { FidRequest, HubResult, MessagesResponse } from '@farcaster/hub-nodejs'
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
import { saveCurrentEventId } from './lib/event.js'
import { log } from './lib/logger.js'

const progressBar = new SingleBar({ fps: 1 }, Presets.shades_classic)

/**
 * Backfill the database with data from a hub. This may take a while.
 */
export async function backfill({ maxFid }: { maxFid?: number | undefined }) {
  // Save the current event ID so we can start from there after backfilling
  await saveCurrentEventId()

  log.info('Backfilling...')
  const startTime = new Date().getTime()
  const allFids = await getAllFids()
  progressBar.start(maxFid || allFids.length, allFids[0])

  for (const fid of allFids) {
    if (maxFid && fid > maxFid) {
      log.warn(`Reached max FID ${maxFid}, stopping backfill`)
      break
    }

    const p = await getFullProfileFromHub(fid).catch((err) => {
      log.error(err, `Error getting profile for FID ${fid}`)
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
  log.info(`Done backfilling in ${elapsedMinutes} minutes`)
  progressBar.stop()
}

/**
 * Index all messages from a profile
 * @param fid Farcaster ID
 */
async function getFullProfileFromHub(_fid: number) {
  const fid = FidRequest.create({ fid: _fid })

  // TODO: add pagination for all of these
  const casts = await client.getCastsByFid({ ...fid, reverse: true })
  const links = await client.getLinksByFid({ ...fid, reverse: true })
  const reactions = await client.getReactionsByFid({ ...fid, reverse: true })
  const userData = await client.getUserDataByFid(fid)
  const verifications = await client.getVerificationsByFid(fid)

  return {
    casts: checkMessages(casts, _fid),
    links: checkMessages(links, _fid),
    reactions: checkMessages(reactions, _fid),
    userData: checkMessages(userData, _fid),
    verifications: checkMessages(verifications, _fid),
  }
}

function checkMessages(messages: HubResult<MessagesResponse>, fid: number) {
  if (messages.isErr()) {
    log.warn(messages.error, `Error fetching messages for FID ${fid}`)
  }

  return messages.isOk() ? messages.value.messages : []
}

/**
 * Get all fids
 * @returns array of fids
 */
async function getAllFids() {
  const maxFidResult = await client.getFids({
    pageSize: 1,
    reverse: true,
  })

  if (maxFidResult.isErr()) {
    throw new Error('Unable to backfill', { cause: maxFidResult.error })
  }

  const maxFid = maxFidResult.value.fids[0]
  return Array.from({ length: Number(maxFid) }, (_, i) => i + 1)
}

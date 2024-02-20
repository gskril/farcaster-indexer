import {
  FidRequest,
  FidsRequest,
  FidsResponse,
  HubResult,
  Message,
} from '@farcaster/hub-nodejs'
import 'dotenv/config'

import {
  castAddBatcher,
  linkAddBatcher,
  reactionAddBatcher,
  userDataAddBatcher,
  verificationAddBatcher,
} from './lib/batch'
import { client } from './lib/client.js'

await backfill()

/**
 * Backfill the database with data from a hub. This may take a while.
 */
async function backfill() {
  console.log('Backfilling...')
  const startTime = new Date().getTime()
  const allFids = await getAllFids()

  for (const fid of allFids) {
    const profile = await getFullProfileFromHub(fid).catch((err) => {
      console.error(`Error getting profile for FID ${fid}`, err)
      return null
    })

    if (!profile) continue

    castAddBatcher.add(profile.casts)
    linkAddBatcher.add(profile.links)
    reactionAddBatcher.add(profile.reactions)
    userDataAddBatcher.add(profile.userData)
    verificationAddBatcher.add(profile.verifications)
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
 * Get all fids from a hub
 * @returns array of fids
 */
async function getAllFids() {
  const fids = new Array<number>()
  let nextPageToken: Uint8Array | undefined = undefined
  let isNextPage = true

  while (isNextPage) {
    const fidsResult: HubResult<FidsResponse> = await client.getFids(
      FidsRequest.create({ pageToken: nextPageToken })
    )

    if (fidsResult.isErr()) {
      console.error(fidsResult.error)
      break
    }

    const response: FidsResponse = fidsResult.value
    fids.push(...response.fids)
    nextPageToken = response.nextPageToken
    isNextPage = !!nextPageToken && nextPageToken.length > 0
  }

  return fids
}

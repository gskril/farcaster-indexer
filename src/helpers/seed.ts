import { HubResult } from '@farcaster/hub-nodejs'
import * as protobufs from '@farcaster/protobufs'

import { client } from '../lib.js'

/**
 * Seed the database with data from the hub
 */
export async function seed() {
  const fids = await getAllFids()

  for (const fid of fids) {
    // @bot account for testing
    if (fid !== 981) break

    const profile = await getFullProfileFromHub(3)
    console.log(profile)
  }
}

/**
 * Index all messages from a profile
 * @param fid Farcaster ID
 */
async function getFullProfileFromHub(_fid: number) {
  const fid = protobufs.FidRequest.create({ fid: _fid })
  protobufs.Metadata

  // TODO: add pagination for all of these (mainly casts and reactions)
  const _casts = (await client.getCastsByFid(fid))._unsafeUnwrap()
  const _reactions = (await client.getReactionsByFid(fid))._unsafeUnwrap()
  const _userData = (await client.getUserDataByFid(fid))._unsafeUnwrap()
  const _verifications = (
    await client.getVerificationsByFid(fid)
  )._unsafeUnwrap()
  const signersResponse = (await client.getSignersByFid(fid))._unsafeUnwrap()

  return {
    casts: _casts.messages,
    reactions: _reactions.messages,
    userData: _userData.messages,
    verifications: _verifications.messages,
    signers: signersResponse.messages,
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
    const fidsResult: HubResult<protobufs.FidsResponse> = await client.getFids(
      protobufs.FidsRequest.create({ pageToken: nextPageToken })
    )

    if (fidsResult.isErr()) {
      console.error(fidsResult.error)
      break
    }

    const response: protobufs.FidsResponse = fidsResult.value
    fids.push(...response.fids)
    nextPageToken = response.nextPageToken
    isNextPage = !!nextPageToken && nextPageToken.length > 0
  }

  return fids
}

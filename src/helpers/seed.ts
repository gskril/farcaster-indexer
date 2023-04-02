import { fromFarcasterTime, HubResult } from '@farcaster/hub-nodejs'
import * as protobufs from '@farcaster/protobufs'
import 'dotenv/config'

import {
  upsertCasts,
  upsertProfiles,
  upsertReactions,
  upsertSigners,
  upsertVerifications,
} from '../api/index.js'
import { client, formatHash, watch } from '../lib.js'
import { Cast, Profile, Reaction, Signer, Verification } from '../types/db.js'
import { MergeMessageHubEvent } from '../types/index.js'

await seed()

/**
 * Seed the database with data from a hub. This may take a while.
 * We'll also start watching for new messages at the same time so we don't miss anything.
 * Errors relating to inserting live events are expected and can be ignored.
 */
export async function seed() {
  watch()
  const startTime = new Date().getTime()
  const allFids = await getAllFids()
  const allVerifications: Verification[] = []
  const allSigners: Signer[] = []

  for (const fid of allFids) {
    const profile = await getFullProfileFromHub(fid)

    allVerifications.push(...profile.verifications)
    allSigners.push(...profile.signers)

    await upsertProfiles(profile.userData)
    await upsertCasts(profile.casts)
    await upsertReactions(profile.reactions)

    // Upsert low volume data for 100 profiles at a time
    if (fid % 100 === 0) {
      await upsertVerifications(allVerifications)
      await upsertSigners(allSigners)

      allVerifications.length = 0
      allSigners.length = 0
    }
  }

  // Upsert remaining data
  await upsertVerifications(allVerifications)
  await upsertSigners(allSigners)

  const endTime = new Date().getTime()
  const elapsedMilliseconds = endTime - startTime
  const elapsedMinutes = elapsedMilliseconds / 60000
  console.log(`Done seeding in ${elapsedMinutes} minutes`)
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

  const casts = hubMessageToJSON(_casts.messages) as MergeMessageHubEvent[]
  // prettier-ignore
  const reactions = hubMessageToJSON(_reactions.messages) as MergeMessageHubEvent[]
  // prettier-ignore
  const userData = hubMessageToJSON(_userData.messages) as MergeMessageHubEvent[]
  // prettier-ignore
  const verifications = hubMessageToJSON(_verifications.messages) as MergeMessageHubEvent[]
  // prettier-ignore
  const signers = hubMessageToJSON(signersResponse.messages) as MergeMessageHubEvent[]

  const formattedCasts: Cast[] = casts.map((cast) => {
    const timestamp = fromFarcasterTime(cast.data.timestamp)._unsafeUnwrap()
    return {
      hash: cast.hash,
      signature: cast.signature,
      signer: cast.signer,
      text: cast.data.castAddBody!.text,
      fid: _fid,
      mentions: cast.data.castAddBody!.mentions,
      parent_fid: cast.data.castAddBody!.parentCastId?.fid,
      parent_hash: cast.data.castAddBody!.parentCastId?.hash,
      thread_hash: null,
      deleted: false,
      published_at: new Date(timestamp),
    }
  })

  const formattedReactions: Reaction[] = reactions.map((reaction) => {
    const timestamp = fromFarcasterTime(reaction.data.timestamp)._unsafeUnwrap()
    return {
      fid: reaction.data.fid,
      target_cast: formatHash(reaction.data.reactionBody!.targetCastId.hash),
      target_fid: reaction.data.reactionBody!.targetCastId.fid,
      type: reaction.data.reactionBody!.type.toString(),
      signer: formatHash(reaction.signer),
      created_at: new Date(timestamp),
    }
  })

  // Each aspect of a profile has it's own message, so we have to match the types according to data.userDataBody.type
  const formattedUserData: Profile = {
    id: _fid,
    avatar_url: userData.find(
      (user) => user.data.userDataBody!.type === 'USER_DATA_TYPE_PFP'
    )?.data.userDataBody?.value,
    display_name: userData.find(
      (user) => user.data.userDataBody!.type === 'USER_DATA_TYPE_DISPLAY'
    )?.data.userDataBody?.value,
    bio: userData.find(
      (user) => user.data.userDataBody!.type === 'USER_DATA_TYPE_BIO'
    )?.data.userDataBody?.value,
    url: userData.find(
      (user) => user.data.userDataBody!.type === 'USER_DATA_TYPE_URL'
    )?.data.userDataBody?.value,
    username: userData.find(
      (user) => user.data.userDataBody!.type === 'USER_DATA_TYPE_FNAME'
    )?.data.userDataBody?.value,
    updated_at: new Date(),
  }

  const formattedVerifications: Verification[] = verifications.map(
    (verification) => {
      const timestamp = fromFarcasterTime(
        verification.data.timestamp
      )._unsafeUnwrap()
      return {
        fid: verification.data.fid,
        address: verification.data.verificationAddEthAddressBody!.address,
        signature: verification.signature,
        signer: formatHash(verification.signer),
        created_at: new Date(timestamp),
      }
    }
  )

  const formattedSigners: Signer[] = signers.map((signer) => {
    const timestamp = fromFarcasterTime(signer.data.timestamp)._unsafeUnwrap()
    return {
      fid: signer.data.fid,
      signer: formatHash(signer.data.signerAddBody!.signer),
      name: signer.data.signerAddBody!.name || null,
      created_at: new Date(timestamp),
    }
  })

  return {
    casts: formattedCasts,
    reactions: formattedReactions,
    userData: formattedUserData,
    verifications: formattedVerifications,
    signers: formattedSigners,
  }
}

/**
 * Convert Hub messages from protobufs to JSON
 * @param messages List of Hub messages as protobufs
 * @returns List of Hub messages as JSON
 */
function hubMessageToJSON(messages: protobufs.Message[]) {
  return messages.map((message) => {
    const json = protobufs.Message.toJSON(message) as MergeMessageHubEvent

    return {
      data: json.data,
      hash: formatHash(json.hash),
      hashScheme: json.hashScheme,
      signature: formatHash(json.signature),
      signatureScheme: json.signatureScheme,
      signer: formatHash(json.signer),
    }
  })
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

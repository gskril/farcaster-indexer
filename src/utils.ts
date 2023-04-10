import { fromFarcasterTime } from '@farcaster/hub-nodejs'

import { formatHash } from './lib.js'
import { MergeMessageHubEvent } from './types'

export function formatCasts(events: MergeMessageHubEvent[]) {
  return events.map((cast) => {
    const timestamp = fromFarcasterTime(cast.data.timestamp)._unsafeUnwrap()
    const parentHash = cast.data.castAddBody!.parentCastId?.hash
    return {
      hash: formatHash(cast.hash),
      signature: formatHash(cast.signature),
      signer: formatHash(cast.signer),
      text: cast.data.castAddBody!.text,
      fid: cast.data.fid,
      mentions: JSON.stringify(cast.data.castAddBody!.mentions),
      parent_fid: cast.data.castAddBody!.parentCastId?.fid || null,
      parent_hash: parentHash ? formatHash(parentHash) : null,
      thread_hash: null,
      published_at: new Date(timestamp),
    }
  })
}

export function formatReactions(events: MergeMessageHubEvent[]) {
  return events.map((reaction) => {
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
}

export function formatUserData(events: MergeMessageHubEvent[], fid: number) {
  // Each aspect of a profile has it's own message, so we have to match the types according to data.userDataBody.type
  return {
    id: fid,
    avatar_url:
      events.find(
        (user) => user.data.userDataBody!.type === 'USER_DATA_TYPE_PFP'
      )?.data.userDataBody?.value || null,
    display_name:
      events.find(
        (user) => user.data.userDataBody!.type === 'USER_DATA_TYPE_DISPLAY'
      )?.data.userDataBody?.value || null,
    bio:
      events.find(
        (user) => user.data.userDataBody!.type === 'USER_DATA_TYPE_BIO'
      )?.data.userDataBody?.value || null,
    url:
      events.find(
        (user) => user.data.userDataBody!.type === 'USER_DATA_TYPE_URL'
      )?.data.userDataBody?.value || null,
    username:
      events.find(
        (user) => user.data.userDataBody!.type === 'USER_DATA_TYPE_FNAME'
      )?.data.userDataBody?.value || null,
    updated_at: new Date(),
  }
}

export function formatVerifications(events: MergeMessageHubEvent[]) {
  return events.map((verification) => {
    const timestamp = fromFarcasterTime(
      verification.data.timestamp
    )._unsafeUnwrap()
    return {
      fid: verification.data.fid,
      address: formatHash(
        verification.data.verificationAddEthAddressBody!.address
      ),
      signature: formatHash(verification.signature),
      signer: formatHash(verification.signer),
      created_at: new Date(timestamp),
    }
  })
}

export function formatSigners(events: MergeMessageHubEvent[]) {
  return events.map((signer) => {
    const timestamp = fromFarcasterTime(signer.data.timestamp)._unsafeUnwrap()
    return {
      fid: signer.data.fid,
      signer: formatHash(signer.data.signerAddBody!.signer),
      name: signer.data.signerAddBody!.name || null,
      created_at: new Date(timestamp),
    }
  })
}

export function breakIntoChunks(array: any[], size: number) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

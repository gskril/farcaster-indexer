import { Message, OnChainEvent, fromFarcasterTime } from '@farcaster/hub-nodejs'
import { Insertable } from 'kysely'

import { Tables } from '../db/db.types.js'

export function formatCasts(msgs: Message[]) {
  return msgs.map((msg) => {
    const data = msg.data!
    const castAddBody = data.castAddBody!
    const timestamp = fromFarcasterTime(data.timestamp)._unsafeUnwrap()

    return {
      timestamp: new Date(timestamp),
      fid: data.fid,
      parentFid: castAddBody.parentCastId?.fid,
      hash: msg.hash,
      parentHash: castAddBody.parentCastId?.hash,
      parentUrl: castAddBody.parentUrl,
      text: castAddBody.text,
      embeds: JSON.stringify(castAddBody.embeds),
      mentions: JSON.stringify(castAddBody.mentions),
      mentionsPositions: JSON.stringify(castAddBody.mentionsPositions),
    } satisfies Insertable<Tables['casts']>
  })
}

export function formatReactions(msgs: Message[]) {
  return msgs.map((msg) => {
    const data = msg.data!
    const reaction = data.reactionBody!
    const timestamp = fromFarcasterTime(data.timestamp)._unsafeUnwrap()

    return {
      timestamp: new Date(timestamp),
      fid: data.fid,
      targetCastFid: reaction.targetCastId?.fid,
      type: reaction.type,
      hash: msg.hash,
      targetCastHash: reaction.targetCastId?.hash,
      targetUrl: reaction.targetUrl,
    } satisfies Insertable<Tables['reactions']>
  })
}

export function formatUserDatas(msgs: Message[]) {
  // Users can submit multiple messages with the same `userDataAddBody.type` within the batch period
  // We reconcile this by using the value of the last message with the same type from that fid
  const userDataMap = new Map<string, Message>()

  for (const msg of msgs) {
    const data = msg.data!
    const userDataAddBody = data.userDataBody!
    userDataMap.set(`fid:${data.fid}-type:${userDataAddBody.type}`, msg)
  }

  return Array.from(userDataMap.values()).map((msg) => {
    const data = msg.data!
    const userDataAddBody = data.userDataBody!
    const timestamp = fromFarcasterTime(data.timestamp)._unsafeUnwrap()

    return {
      timestamp: new Date(timestamp),
      fid: data.fid,
      type: userDataAddBody.type,
      hash: msg.hash,
      value: userDataAddBody.value,
    } satisfies Insertable<Tables['userData']>
  })
}

export function formatVerifications(msgs: Message[]) {
  return msgs.map((msg) => {
    const data = msg.data!
    const addAddressBody = data.verificationAddAddressBody!
    const timestamp = fromFarcasterTime(data.timestamp)._unsafeUnwrap()

    return {
      timestamp: new Date(timestamp),
      fid: data.fid,
      hash: msg.hash,
      signerAddress: addAddressBody.address,
      blockHash: addAddressBody.blockHash,
      signature: addAddressBody.claimSignature,
    } satisfies Insertable<Tables['verifications']>
  })
}

export function formatLinks(msgs: Message[]) {
  return msgs.map((msg) => {
    const data = msg.data!
    const link = data.linkBody!
    const timestamp = fromFarcasterTime(data.timestamp)._unsafeUnwrap()

    return {
      timestamp: new Date(timestamp),
      fid: data.fid,
      targetFid: link.targetFid,
      displayTimestamp: link.displayTimestamp
        ? new Date(fromFarcasterTime(link.displayTimestamp)._unsafeUnwrap())
        : null,
      type: link.type,
      hash: msg.hash,
    } satisfies Insertable<Tables['links']>
  })
}

export function breakIntoChunks(array: any[], size: number) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

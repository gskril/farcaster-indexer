import { HubEvent, HubEventType, MessageType } from '@farcaster/hub-nodejs'

import { deleteCast, insertCasts } from '../api/cast.js'
import { insertReactions } from '../api/reaction.js'
import { insertUserDatas } from '../api/user-data.js'
import { deleteVerification, insertVerifications } from '../api/verification.js'

/**
 * Update the database based on the event type
 * @param event Hub event in JSON format
 */
export async function handleEvent(event: HubEvent) {
  // Handle each event type: MERGE_MESSAGE, PRUNE_MESSAGE, REVOKE_MESSAGE (3), MERGE_ID_REGISTRY_EVENT (4), MERGE_NAME_REGISTRY_EVENT (5)
  if (event.type === HubEventType.MERGE_MESSAGE) {
    event.mergeMessageBody?.message?.data?.type
    event.mergeMessageBody!
    const msg = event.mergeMessageBody!.message!
    const msgType = event.mergeMessageBody!.message!.data!.type

    if (msgType === MessageType.CAST_ADD) {
      await insertCasts([msg])
    } else if (msgType === MessageType.CAST_REMOVE) {
      await deleteCast(msg)
    } else if (msgType === MessageType.VERIFICATION_ADD_ETH_ADDRESS) {
      await insertVerifications([msg])
    } else if (msgType === MessageType.VERIFICATION_REMOVE) {
      await deleteVerification(msg)
    } else if (msgType === MessageType.USER_DATA_ADD) {
      await insertUserDatas([msg])
    } else if (msgType === MessageType.REACTION_ADD) {
      await insertReactions([msg])
    } else if (msgType === MessageType.REACTION_REMOVE) {
      // TODO: figure out how to track reaction deletes. There is nothing like msg.data.reactionRemoveBody
      // await deleteReaction(msg)
    }
  } else if (event.type === HubEventType.PRUNE_MESSAGE) {
    // TODO: Mark the relevant row as `pruned` in the db but don't delete it
    // Not important right now because I don't want to prune data for my applications
  } else if (event.type === HubEventType.REVOKE_MESSAGE) {
    // Events are emitted when a signer that was used to create a message is removed
    // TODO: handle revoking messages
  } else if (event.type === HubEventType.MERGE_ON_CHAIN_EVENT) {
    // TODO: handle onchain events
  } else {
    console.log('UNHANDLED_HUB_EVENT', event.id)
  }
}

/**
 * Convert a Base64 or Uint8Array hash to a hex string
 * @param hash Base64 or Uint8Array hash
 * @returns Hex string
 */
export function formatHash(hash: string | Uint8Array) {
  if (typeof hash === 'string') {
    return '0x' + Buffer.from(hash, 'base64').toString('hex')
  } else {
    return '0x' + Buffer.from(hash).toString('hex')
  }
}

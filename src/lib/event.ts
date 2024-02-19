import { HubEvent, MessageType } from '@farcaster/hub-nodejs'

import { deleteCast, insertCasts } from '../api/cast.js'
import { insertReactions } from '../api/reaction.js'
import { insertUserDatas } from '../api/user-data.js'
import { deleteVerification, insertVerifications } from '../api/verification.js'

/**
 * Update the database based on the event type
 * @param event Hub event in JSON format
 */
export async function handleEvent(event: HubEvent) {
  // Handle each event type: MERGE_MESSAGE (1), PRUNE_MESSAGE (2), REVOKE_MESSAGE (3), MERGE_ID_REGISTRY_EVENT (4), MERGE_NAME_REGISTRY_EVENT (5)
  if (event.type === 1) {
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
    // } else if (event.type === 2) {
    //   // Mark the relevant row as `pruned` in the db but don't delete it
    //   const msg = event.message as MergeMessageHubEvent
    //   const msgType = msg.data.type
    //   if (msgType === 'MESSAGE_TYPE_CAST_ADD') {
    //     await updateCast(msg.hash, { pruned: true })
    //   } else if (msgType === 'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS') {
    //     await updateVerification(msg, { pruned: true })
    //   } else if (msgType === 'MESSAGE_TYPE_REACTION_ADD') {
    //     await updateReaction(msg, { pruned: true })
    //   } else if (msgType === 'MESSAGE_TYPE_SIGNER_ADD') {
    //     await updateSigner(msg, { pruned: true })
    //   }
    // } else if (event.type === 3) {
    //   // Events are emitted when a signer that was used to create a message is removed
    //   // We take care of this within the `MESSAGE_TYPE_SIGNER_REMOVE` message for all entities except profiles
    //   const msg = event.message as MergeMessageHubEvent
    //   const msgType = msg.data.type
    //   if (msgType === 'MESSAGE_TYPE_USER_DATA_ADD') {
    //     await deletePartOfProfile(msg)
    //   }
    // } else if (event.type === 4) {
    //   const msg = event.message as protobufs.IdRegistryEvent
    //   // Handle all event: REGISTER (1), TRANSFER (2)
    //   if (msg.type === 1) {
    //     await insertProfile(msg)
    //   } else if (msg.type === 2) {
    //     await updateProfileOwner(msg)
    //   }
    // } else if (event.type === 5) {
    //   const msg = event.message as protobufs.NameRegistryEvent
    //   // TODO: decode msg.fname
    //   console.log('MERGE_NAME_REGISTRY_EVENT', msg.fname)
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

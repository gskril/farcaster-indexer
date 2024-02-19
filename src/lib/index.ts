import {
  HubEvent,
  Message,
  getSSLHubRpcClient,
  isMergeMessageHubEvent,
  isPruneMessageHubEvent,
  isRevokeMessageHubEvent,
} from '@farcaster/hub-nodejs'

import {
  deleteMessagesFromSigner,
  deletePartOfProfile,
  deleteReaction,
  deleteSigner,
  deleteVerification,
  getLatestEvent,
  insertCast,
  insertEvent,
  insertProfile,
  insertReaction,
  insertSigner,
  insertVerification,
  updateCast,
  updateProfile,
  updateProfileOwner,
  updateReaction,
  updateSigner,
  updateVerification,
} from '../api/index.js'
import { FormattedHubEvent, MergeMessageHubEvent } from '../types'

const HUB_RPC = process.env.HUB_RPC

if (!HUB_RPC) {
  throw new Error('HUB_RPC env variable is not set')
}

export const client = getSSLHubRpcClient(HUB_RPC)

/**
 * Convert a HubEvent (protobufs) to a more readable format (JSON)
 * @param e HubEvent
 * @returns Hub event in JSON format
 */
export function protobufToJson(e: HubEvent) {
  let event: FormattedHubEvent = {
    id: e.id,
    type: e.type,
    message: {},
  }

  if (isMergeMessageHubEvent(e)) {
    event.message = Message.toJSON(e.mergeMessageBody.message!)
  } else if (isPruneMessageHubEvent(e)) {
    event.message = Message.toJSON(e.pruneMessageBody.message!)
  } else if (isRevokeMessageHubEvent(e)) {
    event.message = Message.toJSON(e.revokeMessageBody.message!)
  }
  // else if (isMergeIdRegistryEventHubEvent(e)) {
  //   event.message = IdRegistryEvent.toJSON(
  //     e.mergeIdRegistryEventBody.idRegistryEvent!
  //   )
  // } else if (isMergeNameRegistryEventHubEvent(e)) {
  //   event.message = NameRegistryEvent.toJSON(
  //     e.mergeNameRegistryEventBody.nameRegistryEvent!
  //   )
  // }

  return event
}

/**
 * Update the database based on the event type
 * @param event Hub event in JSON format
 */
export async function handleEvent(event: FormattedHubEvent) {
  // Handle each event type: MERGE_MESSAGE (1), PRUNE_MESSAGE (2), REVOKE_MESSAGE (3), MERGE_ID_REGISTRY_EVENT (4), MERGE_NAME_REGISTRY_EVENT (5)
  if (event.type === 1) {
    const msg = event.message as MergeMessageHubEvent
    const msgType = msg.data.type

    if (msgType === 'MESSAGE_TYPE_CAST_ADD') {
      await insertCast(msg)
    } else if (msgType === 'MESSAGE_TYPE_CAST_REMOVE') {
      await updateCast(msg.data.castRemoveBody!.targetHash, { deleted: true })
    } else if (msgType === 'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS') {
      await insertVerification(msg)
    } else if (msgType === 'MESSAGE_TYPE_VERIFICATION_REMOVE') {
      await deleteVerification(msg)
    } else if (msgType === 'MESSAGE_TYPE_USER_DATA_ADD') {
      await updateProfile(msg)
    } else if (msgType === 'MESSAGE_TYPE_REACTION_ADD') {
      await insertReaction(msg)
    } else if (msgType === 'MESSAGE_TYPE_REACTION_REMOVE') {
      await deleteReaction(msg)
    } else if (msgType === 'MESSAGE_TYPE_SIGNER_ADD') {
      await insertSigner(msg)
    } else if (msgType === 'MESSAGE_TYPE_SIGNER_REMOVE') {
      await deleteSigner(msg)
      await deleteMessagesFromSigner(
        formatHash(msg.data.signerRemoveBody!.signer)
      )
    }
  } else if (event.type === 2) {
    // Mark the relevant row as `pruned` in the db but don't delete it
    const msg = event.message as MergeMessageHubEvent
    const msgType = msg.data.type

    if (msgType === 'MESSAGE_TYPE_CAST_ADD') {
      await updateCast(msg.hash, { pruned: true })
    } else if (msgType === 'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS') {
      await updateVerification(msg, { pruned: true })
    } else if (msgType === 'MESSAGE_TYPE_REACTION_ADD') {
      await updateReaction(msg, { pruned: true })
    } else if (msgType === 'MESSAGE_TYPE_SIGNER_ADD') {
      await updateSigner(msg, { pruned: true })
    }
  } else if (event.type === 3) {
    // Events are emitted when a signer that was used to create a message is removed
    // We take care of this within the `MESSAGE_TYPE_SIGNER_REMOVE` message for all entities except profiles
    const msg = event.message as MergeMessageHubEvent
    const msgType = msg.data.type

    if (msgType === 'MESSAGE_TYPE_USER_DATA_ADD') {
      await deletePartOfProfile(msg)
    }
  } else if (event.type === 4) {
    const msg = event.message as protobufs.IdRegistryEvent

    // Handle all event: REGISTER (1), TRANSFER (2)
    if (msg.type === 1) {
      await insertProfile(msg)
    } else if (msg.type === 2) {
      await updateProfileOwner(msg)
    }
  } else if (event.type === 5) {
    const msg = event.message as protobufs.NameRegistryEvent

    // TODO: decode msg.fname
    console.log('MERGE_NAME_REGISTRY_EVENT', msg.fname)
  } else {
    console.log('UNHANDLED_HUB_EVENT', event)
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

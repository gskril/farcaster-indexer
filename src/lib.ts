import { getHubRpcClient } from '@farcaster/hub-nodejs'
import * as protobufs from '@farcaster/protobufs'

import {
  insertCast,
  deleteCast,
  insertVerification,
  deleteVerification,
  updateProfile,
  insertProfile,
  updateProfileOwner,
  insertReaction,
  deleteReaction,
  insertSigner,
  deleteSigner,
  deleteMessagesFromSigner,
  deletePartOfProfile,
} from './api/index.js'
import { FormattedHubEvent, MergeMessageHubEvent } from './types'

export const client = await getHubRpcClient('127.0.0.1:2283')

/**
 * Convert a HubEvent (protobufs) to a more readable format (JSON)
 * @param e HubEvent
 * @returns Hub event in JSON format
 */
export function protobufToJson(e: protobufs.HubEvent) {
  let event: FormattedHubEvent = {
    type: e.type,
    message: {},
  }

  if (protobufs.isMergeMessageHubEvent(e)) {
    event.message = protobufs.Message.toJSON(e.mergeMessageBody.message!)
  } else if (protobufs.isPruneMessageHubEvent(e)) {
    event.message = protobufs.Message.toJSON(e.pruneMessageBody.message!)
  } else if (protobufs.isRevokeMessageHubEvent(e)) {
    event.message = protobufs.Message.toJSON(e.revokeMessageBody.message!)
  } else if (protobufs.isMergeIdRegistryEventHubEvent(e)) {
    event.message = protobufs.IdRegistryEvent.toJSON(
      e.mergeIdRegistryEventBody.idRegistryEvent!
    )
  } else if (protobufs.isMergeNameRegistryEventHubEvent(e)) {
    event.message = protobufs.NameRegistryEvent.toJSON(
      e.mergeNameRegistryEventBody.nameRegistryEvent!
    )
  }

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
      await deleteCast(msg)
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
    console.log('UNKNOWN_HUB_EVENT', event)
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

/**
 * Listen for new events from a Hub
 */
export async function watch() {
  const result = await client.subscribe({ eventTypes: [0, 1, 2, 3, 4, 5] })

  result.match(
    (stream) => {
      console.log('Subscribed to stream')
      stream.on('data', async (e: protobufs.HubEvent) => {
        const event = protobufToJson(e)
        await handleEvent(event)
      })
    },
    (e) => {
      console.error('Error streaming data.', e)
    }
  )
}

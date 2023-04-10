import { getSSLHubRpcClient } from '@farcaster/hub-nodejs'
import * as protobufs from '@farcaster/protobufs'

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
} from './api/index.js'
import { FormattedHubEvent, MergeMessageHubEvent } from './types'

const HUB_RPC = process.env.HUB_RPC

if (!HUB_RPC) {
  throw new Error('HUB_RPC env variable is not set')
}

let latestEventId: number
export const client = getSSLHubRpcClient(HUB_RPC)

/**
 * Convert a HubEvent (protobufs) to a more readable format (JSON)
 * @param e HubEvent
 * @returns Hub event in JSON format
 */
export function protobufToJson(e: protobufs.HubEvent) {
  let event: FormattedHubEvent = {
    id: e.id,
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

/**
 * Listen for new events from a Hub
 */
export async function watch() {
  // Check the latest hub event we processed, if any
  const latestEventIdFromDb = await getLatestEvent()

  const result = await client.subscribe({
    eventTypes: [0, 1, 2, 3, 4, 5],
    fromId: latestEventIdFromDb,
  })

  if (result.isErr()) {
    console.error('Error starting stream', result.error)
    return
  }

  result.match(
    (stream) => {
      console.log(
        `Subscribed to stream ${
          latestEventIdFromDb ? `from event ${latestEventIdFromDb}` : ''
        }`
      )
      stream.on('data', async (e: protobufs.HubEvent) => {
        // Keep track of latest event so we can pick up where we left off if the stream is interrupted
        latestEventId = e.id

        const event = protobufToJson(e)
        await handleEvent(event)
      })
    },
    (e) => {
      console.error('Error streaming data.', e)
    }
  )
}

// Handle graceful shutdown and log the latest event ID
async function handleShutdownSignal(signalName: string) {
  console.log(`${signalName} received`)

  if (latestEventId) {
    console.log('Latest event ID:', latestEventId)
    await insertEvent(latestEventId)
  } else {
    console.log('No hub event in cache')
  }

  process.exit(0)
}

process.on('SIGINT', async () => {
  await handleShutdownSignal('SIGINT')
})

process.on('SIGTERM', async () => {
  await handleShutdownSignal('SIGTERM')
})

process.on('SIGQUIT', async () => {
  await handleShutdownSignal('SIGQUIT')
})

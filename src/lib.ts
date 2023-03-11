import { Client, types } from '@farcaster/js'
import * as protobufs from '@farcaster/protobufs'

export const client = new Client('127.0.0.1:13112')

/**
 * Convert a HubEvent (protobufs) to a more readable format (JSON)
 * @param e HubEvent
 * @returns Hub event in JSON format
 */
export function formatEvent(e: protobufs.HubEvent) {
  let event: { type: protobufs.HubEventType; message: unknown } = {
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

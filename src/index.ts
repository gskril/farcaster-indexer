import * as protobufs from '@farcaster/protobufs'
import 'dotenv/config'

import { sampleCast } from './helpers/heartbeat.js'
import { client } from './lib.js'

setTimeout(async () => {
  await sampleCast()
}, 1000)

async function watch() {
  const result = await client.subscribe()

  result.match(
    (stream) => {
      console.log('streaming data')
      stream.on('data', (e: protobufs.HubEvent) => {
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

        console.log(event.message)
      })
    },
    (e) => {
      console.log('error', e)
    }
  )
}

await watch()

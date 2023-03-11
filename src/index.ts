import * as protobufs from '@farcaster/protobufs'
import 'dotenv/config'

import { sampleCast } from './helpers/heartbeat.js'
import { client, formatEvent } from './lib.js'
import { MergeMessageHubEvent } from './types/index.js'

setTimeout(async () => {
  await sampleCast()
}, 1000)

async function watch() {
  const result = await client.subscribe()

  result.match(
    (stream) => {
      console.log('streaming data')
      stream.on('data', (e: protobufs.HubEvent) => {
        const event = formatEvent(e)

        // Handle each event type: MERGE_MESSAGE (1), PRUNE_MESSAGE (2), REVOKE_MESSAGE (3), MERGE_ID_REGISTRY_EVENT (4), MERGE_NAME_REGISTRY_EVENT (5)
        switch (event.type) {
          case 1:
            const message = event.message as MergeMessageHubEvent

            console.log('MERGE_MESSAGE')
            break
          case 2:
            console.log('PRUNE_MESSAGE')
            break
          case 3:
            console.log('REVOKE_MESSAGE')
            break
          case 4:
            console.log('MERGE_ID_REGISTRY_EVENT')
            break
          case 5:
            console.log('MERGE_NAME_REGISTRY_EVENT')
            break
          default:
            console.log('UNKNOWN EVENT TYPE')
        }
      })
    },
    (e) => {
      console.log('error', e)
    }
  )
}

await watch()

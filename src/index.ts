import * as protobufs from '@farcaster/protobufs'
import 'dotenv/config'

import { sampleCast } from './helpers/heartbeat.js'
import { client, protobufToJson, handleEvent } from './lib.js'

setTimeout(async () => {
  await sampleCast()
}, 1000)

async function watch() {
  const result = await client.subscribe()

  result.match(
    (stream) => {
      console.log('Subscribed to stream')
      stream.on('data', async (e: protobufs.HubEvent) => {
        const event = protobufToJson(e)
        await handleEvent(event).catch((e) => {
          console.log('Error handling event.', e)
        })
      })
    },
    (e) => {
      console.log('Error streaming data.', e)
    }
  )
}

await watch()

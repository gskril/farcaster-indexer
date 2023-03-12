import * as protobufs from '@farcaster/protobufs'
import 'dotenv/config'

import {
  deleteCast,
  likeCast,
  publishCast,
  sleep,
  unlikeCast,
  updatePfp,
} from './helpers/dummy.js'
import { client, protobufToJson, handleEvent } from './lib.js'

async function sendTestMessages() {
  await sleep()
  const cast = await publishCast()
  if (!cast) return

  await sleep()
  await likeCast(cast)

  await sleep()
  await unlikeCast(cast)

  await sleep()
  await updatePfp()

  await sleep()
  await deleteCast(cast)
}

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
await sendTestMessages()

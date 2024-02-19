import { HubEvent, Message } from '@farcaster/hub-nodejs'

import { client } from '.'
import { getLatestEvent, insertEvent } from '../api'

let latestEventId: number | undefined

/**
 * Listen for new events from a Hub
 */
export async function subscribe() {
  // Check the latest hub event we processed, if any
  const latestEventIdFromDb = await getLatestEvent()

  const result = await client.subscribe({
    /* 
      MERGE_MESSAGE = 1
      PRUNE_MESSAGE = 2
      REVOKE_MESSAGE = 3
      MERGE_USERNAME_PROOF = 6
      MERGE_ON_CHAIN_EVENT = 9
    */
    eventTypes: [1, 2, 3, 6, 9],
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
      stream.on('data', async (e: HubEvent) => {
        // Keep track of latest event so we can pick up where we left off if the stream is interrupted
        latestEventId = e.id

        const json = Message.toJSON(e.mergeMessageBody?.message!)
        console.log(e, json)

        // const event = protobufToJson(e)
        // await handleEvent(event)
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

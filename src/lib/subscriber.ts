import { HubEvent, HubEventType } from '@farcaster/hub-nodejs'

import { getLatestEvent, insertEvent } from '../api/event.js'
import { client } from './client.js'
import { handleEvent } from './event.js'

let latestEventId: number | undefined

/**
 * Listen for new events from a Hub
 */
export async function subscribe() {
  // Check the latest hub event we processed, if any
  const latestEventIdFromDb = await getLatestEvent()

  const result = await client.subscribe({
    eventTypes: [
      HubEventType.MERGE_MESSAGE,
      HubEventType.PRUNE_MESSAGE,
      HubEventType.REVOKE_MESSAGE,
      // HubEventType.MERGE_USERNAME_PROOF,
      // HubEventType.MERGE_ON_CHAIN_EVENT,
    ],
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
        await handleEvent(e)
      })
    },
    (e) => {
      console.error('Error streaming data.', e)
    }
  )
}

// Handle graceful shutdown and log the latest event ID
async function handleShutdownSignal(signalName: string) {
  client.close()
  console.log(`${signalName} received`)

  // TODO: figure out how to handle this in a more robust way.
  // As-is, the latest event ID will be logged but we don't know if
  // it was successfully processed due to the Bottleneck.Batcher logic
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

import { HubEvent, HubEventType } from '@farcaster/hub-nodejs'

import { insertEvent } from '../api/event.js'
import { client } from './client.js'
import { handleEvent } from './event.js'
import { log } from './logger.js'

let latestEventId: number | undefined

/**
 * Listen for new events from a Hub
 */
export async function subscribe(fromId: number | undefined) {
  const result = await client.subscribe({
    eventTypes: [
      HubEventType.MERGE_MESSAGE,
      HubEventType.PRUNE_MESSAGE,
      HubEventType.REVOKE_MESSAGE,
      // HubEventType.MERGE_USERNAME_PROOF,
      // HubEventType.MERGE_ON_CHAIN_EVENT,
    ],
    fromId,
  })

  if (result.isErr()) {
    log.error(result.error, 'Error starting stream')
    return
  }

  result.match(
    (stream) => {
      log.info(`Subscribed to stream ${fromId ? `from event ${fromId}` : ''}`)

      stream.on('data', async (e: HubEvent) => {
        // Keep track of latest event so we can pick up where we left off if the stream is interrupted
        latestEventId = e.id
        await handleEvent(e)
      })

      stream.on('close', async () => {
        log.warn(`Hub stream closed`)
      })

      stream.on('end', async () => {
        log.warn(`Hub stream ended`)
      })
    },
    (e) => {
      log.error(e, 'Error streaming data.')
    }
  )
}

// Handle graceful shutdown and log the latest event ID
async function handleShutdownSignal(signalName: string) {
  client.close()
  log.info(`${signalName} received`)

  // TODO: figure out how to handle this in a more robust way.
  // As-is, the latest event ID will be logged but we don't know if
  // it was successfully processed due to the Bottleneck.Batcher logic
  if (latestEventId) {
    log.info(`Latest event ID: ${latestEventId}`)
    await insertEvent(latestEventId)
  } else {
    log.warn('No hub event in cache')
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

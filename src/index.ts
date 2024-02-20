import 'dotenv/config'

import { getLatestEvent } from './api/event.js'
import { backfill } from './backfill.js'
import { subscribe } from './lib/subscriber.js'

// Check the latest hub event we processed, if any
const latestEventId = await getLatestEvent()

// Hubs are expected to prune messages after 3 days
// TODO: Check if `latestEvent` is pruned and backfill if so
// const latestEventRequest = EventRequest.create({ id: latestEventId })
// const latestEvent = await client.getEvent(latestEventRequest)

// If the first argument is "--backfill", run the backfill function
if (process.argv[2] === '--backfill') {
  await backfill()
}

await subscribe(latestEventId)

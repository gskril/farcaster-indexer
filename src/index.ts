import 'dotenv/config'
import { providers, Contract } from 'ethers'
import cron from 'node-cron'

import {
  idRegistryAddr,
  idRegistryAbi,
  IdRegistryEvents,
} from './contracts/id-registry.js'
import { indexAllCasts } from './functions/index-casts.js'
import { indexVerifications } from './functions/index-verifications.js'
import { upsertRegistrations } from './functions/read-logs.js'
import { updateAllProfiles } from './functions/update-profiles.js'
import supabase from './supabase.js'
import { FlattenedProfile } from './types/index.js'

// Set up the provider
const ALCHEMY_SECRET = process.env.ALCHEMY_SECRET
const provider = new providers.AlchemyProvider('optimism', ALCHEMY_SECRET)

// Create ID Registry contract interface
const idRegistry = new Contract(idRegistryAddr, idRegistryAbi, provider)

// Listen for new events on the ID Registry
const eventToWatch: IdRegistryEvents = 'Register'
idRegistry.on(eventToWatch, async (to, id) => {
  console.log('New user registered.', Number(id), to)

  const profile: FlattenedProfile = {
    id: Number(id),
    owner: to,
    registered_at: new Date(),
  }

  // Save to supabase
  await supabase.from('profile').insert(profile)
})

// Make sure we didn't miss any profiles when the indexer was offline
await upsertRegistrations(provider, idRegistry)

// Run job every 2 minutes
cron.schedule('*/2 * * * *', async () => {
  await indexAllCasts(5_000)
})

// Run job every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  await updateAllProfiles()
})

// Run job every 2 hours
cron.schedule('0 */2 * * *', async () => {
  await indexVerifications()
})

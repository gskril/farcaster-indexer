import 'dotenv/config'
import { providers, Contract } from 'ethers'
import cron from 'node-cron'
import supabase from './supabase.js'

import { upsertAllRegistrations } from './functions/read-logs.js'
import { IdRegistry, IdRegistryEvents } from './contracts/types/id-registry.js'
import { idRegistryAddr, idRegistryAbi } from './contracts/id-registry.js'
import { indexAllCasts } from './functions/index-casts.js'
import { updateAllProfiles } from './functions/update-profiles.js'

// Set up the provider
const ALCHEMY_SECRET = process.env.ALCHEMY_SECRET
const provider = new providers.AlchemyProvider('goerli', ALCHEMY_SECRET)

// Create ID Registry contract interface
const idRegistry = new Contract(
  idRegistryAddr,
  idRegistryAbi,
  provider
) as IdRegistry

// Listen for new events on the ID Registry
const eventToWatch: IdRegistryEvents = 'Register'
idRegistry.on(eventToWatch, async (to, id) => {
  console.log('New user registered.', Number(id), to)

  // Save to supabase
  const { error } = await supabase.from('profiles_new').insert({
    id: Number(id),
    address: to,
  })

  if (error) {
    throw error
  }
})

// Make sure we didn't miss any profiles when the indexer was offline
await upsertAllRegistrations(provider, idRegistry)

// Run job every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  await indexAllCasts()
})

// Run job every 2 hours
cron.schedule('0 */2 * * *', async () => {
  await updateAllProfiles()
})

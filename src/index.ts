import 'dotenv/config'
import { providers, Contract, utils } from 'ethers'
import cron from 'node-cron'
import got from 'got'
import supabase from './supabase.js'

import {
  IdRegistry,
  IdRegistryEvents,
  RegisterEventEmittedResponse,
} from './contracts/types/id-registry.js'
import { idRegistryAddr, idRegistryAbi } from './contracts/id-registry.js'
import {
  NameRegistry,
  NameRegistryEvents,
} from './contracts/types/name-registry.js'
import { nameRegistryAddr, nameRegistryAbi } from './contracts/name-registry.js'

import { breakIntoChunks, cleanUserActivity, getProfileInfo } from './utils.js'
import { getIdRegistryEvents } from './functions/read-logs.js'
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

const eventToWatch: IdRegistryEvents = 'Register'
idRegistry.on(eventToWatch, async (to, id) => {
  console.log('New user registered.', Number(id), to)

  const profile = await getProfileInfo(to)

  const { error } = await supabase.from('profiles_new').upsert({
    id: Number(id),
    address: to,
    username: profile?.username || null,
    display_name: profile?.displayName || null,
    followers: profile?.followerCount || null,
    following: profile?.followingCount || null,
    referrer: profile?.referrerUsername || null,
  })

  if (error) {
    console.error(error)
  } else {
  }
})

await updateAllProfiles()

// ONE TIME DUMP ↓ should normally add by listening to contract events like above
// Get all logs from the ID Registry contract since creation
/* const registrations = await getIdRegistryEvents({
  provider,
  contract: idRegistry,
})

// Insert to Supabase
await supabase
  .from('profiles_new')
  .upsert(registrations)
  .then(() => console.log('Inserted to Supabase')) */

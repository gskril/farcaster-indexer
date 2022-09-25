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
import { getIdRegistryEvents } from './contracts/utils.js'

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
idRegistry.on(eventToWatch, async (to, id, recovery, url) => {
  console.log('New user registered.', to, id)
})

// Get all logs from the ID Registry contract since creation
await getIdRegistryEvents({
  provider,
  contract: idRegistry,
})

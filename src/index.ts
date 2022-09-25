import 'dotenv/config'
import { providers, Contract, utils } from 'ethers'
import cron from 'node-cron'
import got from 'got'
import supabase from './supabase.js'

import { IdRegistry as IdRegistryInterface } from './contracts/types/id-registry.js'
import { idRegistryAddr, idRegistryAbi } from './contracts/id-registry.js'
import { NameRegistry as NameRegistryInterface } from './contracts/types/name-registry.js'
import { nameRegistryAddr, nameRegistryAbi } from './contracts/name-registry.js'

import { breakIntoChunks, cleanUserActivity, getProfileInfo } from './utils.js'

// Set up the provider
const ALCHEMY_SECRET = process.env.ALCHEMY_SECRET
const provider = new providers.AlchemyProvider('goerli', ALCHEMY_SECRET)

// Create ID Registry contract interface
const idRegistry = new Contract(
  idRegistryAddr,
  idRegistryAbi,
  provider
) as unknown as IdRegistryInterface

// Create Name Registry contract interface
const nameRegistry = new Contract(
  nameRegistryAddr,
  nameRegistryAbi,
  provider
) as unknown as NameRegistryInterface

console.log(await idRegistry.idOf('0x4114E33eb831858649ea3702E1C9a2db3f626446'))

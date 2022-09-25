import 'dotenv/config'
import { providers, Contract, utils } from 'ethers'
// import cron from 'node-cron'
// import got from 'got'

// import { breakIntoChunks, cleanUserActivity, getProfileInfo } from './utils.js'
import {
  idRegistryAddr,
  idRegistryAbi,
  IdRegistry as IdRegistryInterface,
} from './contracts/id-registry.js'
import {
  nameRegistryAddr,
  nameRegistryAbi,
  NameRegistry as NameRegistryInterface,
} from './contracts/name-registry.js'
// import supabase from './supabase.js'

// Set up the provider
const ALCHEMY_SECRET = process.env.ALCHEMY_SECRET
const provider = new providers.AlchemyProvider('goerli', ALCHEMY_SECRET)

// Create contract interfaces
const idRegistry = new Contract(
  idRegistryAddr,
  idRegistryAbi,
  provider
) as unknown as IdRegistryInterface
const nameRegistry = new Contract(nameRegistryAddr, nameRegistryAbi, provider)

console.log(await idRegistry.idOf('0x4114E33eb831858649ea3702E1C9a2db3f626446'))

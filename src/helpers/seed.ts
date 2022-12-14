import 'dotenv/config'
import { providers, Contract } from 'ethers'

import { indexVerifications } from '../functions/index-verifications.js'
import { idRegistryAddr, idRegistryAbi } from './../contracts/id-registry.js'
import { IdRegistry } from './../contracts/types/id-registry.js'
import { indexAllCasts } from './../functions/index-casts.js'
import { upsertAllRegistrations } from './../functions/read-logs.js'
import { updateAllProfiles } from './../functions/update-profiles.js'

// Set up the provider
const ALCHEMY_SECRET = process.env.ALCHEMY_SECRET
const provider = new providers.AlchemyProvider('goerli', ALCHEMY_SECRET)

// Create ID Registry contract interface
const idRegistry = new Contract(
  idRegistryAddr,
  idRegistryAbi,
  provider
) as IdRegistry

console.log('Seeding registrations from contract logs...')
await upsertAllRegistrations(provider, idRegistry)

console.log('Seeding profiles from Merkle APIs...')
await updateAllProfiles()

console.log('Seeding casts from Merkle APIs...')
await indexAllCasts()

if (process.argv.includes('--verifications')) {
  console.log('Seeding verifications from Merkle APIs...')
  await indexVerifications()
}

console.log('Seeding complete!')

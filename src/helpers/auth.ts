import { MerkleAPIClient } from '@standard-crypto/farcaster-js'
import 'dotenv/config'
import { Wallet } from 'ethers'

const FC_MNEMONIC = process.env.FC_MNEMONIC

if (!FC_MNEMONIC) {
  throw new Error('Missing Farcaster Recovery Phrase')
}

const wallet = Wallet.fromMnemonic(FC_MNEMONIC)
const client = new MerkleAPIClient(wallet)

const EXPIRY_DURATION_MS = 31536000000 // 1 year
const bearerToken = await client.createAuthToken(EXPIRY_DURATION_MS)
console.log(bearerToken)

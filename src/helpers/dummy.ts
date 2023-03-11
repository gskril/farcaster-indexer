import {
  Ed25519Signer,
  Eip712Signer,
  makeCastAdd,
  makeSignerAdd,
  types,
} from '@farcaster/js'
import * as ed from '@noble/ed25519'
import { ethers } from 'ethers'

import { client } from '../lib.js'
import supabase from '../supabase.js'
import { Profile } from '../types/db.js'

const fid = 981

// Create a new signer
const ed25519Signer = await createSigner()

// Insert profile to allow for testing (otherwise violates key constraint)
const profile: Profile = { id: 981, username: 'bot' }
await supabase.from('profile').upsert(profile)

export async function sampleCast(index?: number) {
  // Create a SignerAdd message that contains the public key of the signer
  const dataOptions = {
    fid,
    network: types.FarcasterNetwork.DEVNET,
  }

  // Make a new cast
  const cast = await makeCastAdd(
    { text: `cast ${index || ''}` },
    dataOptions,
    ed25519Signer
  )
  await client.submitMessage(cast._unsafeUnwrap())
}

export async function createSigner() {
  const pkey = process.env.FARCASTER_PRIVATE_KEY

  if (!pkey) {
    throw new Error('FARCASTER_PRIVATE_KEY is not set')
  }

  const wallet = new ethers.Wallet(pkey)
  const eip712Signer = Eip712Signer.fromSigner(
    wallet,
    wallet.address
  )._unsafeUnwrap()

  // Generate a new Ed25519 key pair which will become the Signer and store the private key securely
  const signerPrivateKey = ed.utils.randomPrivateKey()
  const ed25519Signer =
    Ed25519Signer.fromPrivateKey(signerPrivateKey)._unsafeUnwrap()

  // Create a SignerAdd message that contains the public key of the signer
  const dataOptions = {
    fid: fid, // Set to the fid of the user
    network: types.FarcasterNetwork.DEVNET,
  }
  const signerAddResult = await makeSignerAdd(
    { signer: ed25519Signer.signerKeyHex, name: 'test' },
    dataOptions,
    eip712Signer
  )

  // Submit the SignerAdd message to the Hub
  const signerAdd = signerAddResult._unsafeUnwrap()
  const result = await client.submitMessage(signerAdd)

  if (!result.isOk()) {
    console.log(result.error)
  }

  return ed25519Signer
}

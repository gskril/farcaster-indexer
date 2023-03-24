import {
  Ed25519Signer,
  Eip712Signer,
  EthersEip712Signer,
  makeCastAdd,
  makeCastRemove,
  makeReactionAdd,
  makeReactionRemove,
  makeSignerAdd,
  makeSignerRemove,
  makeUserDataAdd,
  NobleEd25519Signer,
} from '@farcaster/hub-nodejs'
import * as protobufs from '@farcaster/protobufs'
import * as ed from '@noble/ed25519'
import { Wallet } from 'ethers'

import { client } from '../lib.js'
import supabase from '../supabase.js'
import { Profile } from '../types/db.js'

const fid = 981
const dataOptions = { fid, network: protobufs.FarcasterNetwork.DEVNET }

// Insert profile to allow for testing (otherwise violates key constraint)
const profile: Profile = { id: fid, username: 'bot' }
await supabase.from('profile').upsert(profile)

const pkey = process.env.FARCASTER_PRIVATE_KEY
if (!pkey) throw new Error('FARCASTER_PRIVATE_KEY is not set')
const wallet = new Wallet(pkey)

/**
 * Publish a new cast
 * @returns Cast hash
 */
export async function publishCast(ed25519Signer: Ed25519Signer) {
  // Make a new cast
  const cast = await makeCastAdd(
    protobufs.CastAddBody.create({ text: 'hello world' }),
    dataOptions,
    ed25519Signer
  )
  const castMessage = await client.submitMessage(cast._unsafeUnwrap())

  if (!castMessage.isOk()) {
    console.log(castMessage.error)
    return
  }

  return castMessage._unsafeUnwrap().hash
}

/**
 * Like a cast
 * @param hash Cast hash
 */
export async function likeCast(hash: string, ed25519Signer: Ed25519Signer) {
  const reactionLikeBody = {
    type: protobufs.ReactionType.LIKE,
    target: { fid, hash },
  }

  const like = await makeReactionAdd(
    reactionLikeBody,
    dataOptions,
    ed25519Signer
  )

  const likeMessage = await client.submitMessage(like._unsafeUnwrap())

  if (likeMessage.isErr()) {
    console.error(likeMessage.error)
  }
}

/**
 * Remove like from a cast
 * @param hash Cast hash
 */
export async function unlikeCast(hash: string, ed25519Signer: Ed25519Signer) {
  const reactionLikeBody = {
    type: protobufs.ReactionType.LIKE,
    target: { fid, hash },
  }

  const unlike = await makeReactionRemove(
    reactionLikeBody,
    dataOptions,
    ed25519Signer
  )

  const unlikeMessage = await client.submitMessage(unlike._unsafeUnwrap())

  if (unlikeMessage.isErr()) {
    console.error(unlikeMessage.error)
  }
}

/**
 * Delete a cast
 * @param hash Cast hash
 */
export async function deleteCast(
  hash: Uint8Array,
  ed25519Signer: Ed25519Signer
) {
  const castRemove = await makeCastRemove(
    protobufs.CastRemoveBody.create({ targetHash: hash }),
    dataOptions,
    ed25519Signer
  )

  const deleteMessage = await client.submitMessage(castRemove._unsafeUnwrap())

  if (deleteMessage.isErr()) {
    console.error(deleteMessage.error)
  }
}

/**
 * Update profile picture
 */
export async function updatePfp(ed25519Signer: Ed25519Signer) {
  const userDataPfpBody = {
    type: protobufs.UserDataType.PFP,
    value: 'https://i.imgur.com/yed5Zfk.gif',
  }

  const userDataPfpAdd = await makeUserDataAdd(
    userDataPfpBody,
    dataOptions,
    ed25519Signer
  )

  const updateMessage = await client.submitMessage(
    userDataPfpAdd._unsafeUnwrap()
  )

  if (updateMessage.isErr()) {
    console.error(updateMessage.error)
  }
}

/**
 * Create a new signer from a private key
 * @returns Ed25519Signer
 */
export async function createSigner() {
  const eip712Signer = new EthersEip712Signer(wallet)

  // Generate a new Ed25519 key pair which will become the Signer and store the private key securely
  const signerPrivateKey = ed.utils.randomPrivateKey()
  const ed25519Signer = new NobleEd25519Signer(signerPrivateKey)

  // Create a SignerAdd message that contains the public key of the signer
  const dataOptions = {
    fid,
    network: protobufs.FarcasterNetwork.TESTNET,
  }

  const signerAddResult = await makeSignerAdd(
    {
      signer: (await ed25519Signer.getSignerKey())._unsafeUnwrap(),
      name: 'test signer',
    },
    dataOptions,
    eip712Signer
  )

  // Submit the SignerAdd message to the Hub
  const signerAdd = signerAddResult._unsafeUnwrap()
  const result = await client.submitMessage(signerAdd)

  if (!result.isOk()) {
    console.error(result.error)
  }

  return ed25519Signer
}

/**
 * Delete a signer
 */
export async function deleteSigner(ed25519Signer: Ed25519Signer) {
  const body: protobufs.SignerRemoveBody = {
    signer: (await ed25519Signer.getSignerKey())._unsafeUnwrap(),
  }

  // const eip712Signer = Eip712Signer.fromSigner(
  //   wallet,
  //   wallet.address
  // )._unsafeUnwrap()

  // const signerRemoveResult = await makeSignerRemove(
  //   body,
  //   dataOptions,
  //   eip712Signer
  // )

  // Submit the SignerRemove message to the Hub
  // const signerRemove = signerRemoveResult._unsafeUnwrap()
  // const result = await client.submitMessage(signerRemove)

  // if (result.isErr()) {
  //   console.error(result.error)
  // }
}

/**
 * Pause for a given number of seconds
 * @param seconds Number of seconds, default 2
 * @returns
 */
export async function sleep(seconds?: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, seconds ? seconds * 1000 : 2000)
  )
}

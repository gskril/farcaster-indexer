import {
  Ed25519Signer,
  EthersEip712Signer,
  hexStringToBytes,
  makeCastAdd,
  makeCastRemove,
  makeReactionAdd,
  makeReactionRemove,
  makeSignerAdd,
  makeSignerRemove,
  makeUserDataAdd,
  makeVerificationAddEthAddress,
  makeVerificationEthAddressClaim,
  NobleEd25519Signer,
} from '@farcaster/hub-nodejs'
import * as protobufs from '@farcaster/protobufs'
import * as ed from '@noble/ed25519'
import { Wallet } from 'ethers'

import { db } from '../db.js'
import { client } from '../lib.js'

// test account that matches the FARCASTER_PRIVATE_KEY in your .env file
export const account = { fid: 981, username: 'bot' }

const dataOptions = {
  fid: account.fid,
  network: protobufs.FarcasterNetwork.DEVNET,
}

// Insert profile to allow for testing
await db
  .insertInto('profile')
  .values({ id: account.fid, username: account.username })
  .onConflict((oc) => oc.column('id').doNothing())
  .execute()

const pkey = process.env.FARCASTER_PRIVATE_KEY
if (!pkey) throw new Error('FARCASTER_PRIVATE_KEY is not set')
const wallet = new Wallet(pkey)

/**
 * Publish a new cast
 * @param ed25519Signer Signer
 * @returns Cast hash
 */
async function publishCast(ed25519Signer: Ed25519Signer) {
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
 * @param ed25519Signer Signer
 */
async function likeCast(hash: Uint8Array, ed25519Signer: Ed25519Signer) {
  const reactionLikeBody = {
    type: protobufs.ReactionType.LIKE,
    targetCastId: { fid: account.fid, hash },
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
 * @param ed25519Signer Signer
 */
async function unlikeCast(hash: Uint8Array, ed25519Signer: Ed25519Signer) {
  const reactionLikeBody = {
    type: protobufs.ReactionType.LIKE,
    targetCastId: { fid: account.fid, hash },
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
 * @param ed25519Signer Signer
 */
async function deleteCast(hash: Uint8Array, ed25519Signer: Ed25519Signer) {
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
 * Add verification
 * @param ed25519Signer Signer
 */
async function addVerification(ed25519Signer: Ed25519Signer) {
  const eip712Signer = new EthersEip712Signer(wallet)
  const addressBytes = (await eip712Signer.getSignerKey())._unsafeUnwrap()

  // Constant block hash from hubble for testing
  const blockHashHex =
    '0x1d3b0456c920eb503450c7efdcf9b5cf1f5184bf04e5d8ecbcead188a0d02018'
  const blockHashBytes = hexStringToBytes(blockHashHex)._unsafeUnwrap()

  const claimResult = makeVerificationEthAddressClaim(
    account.fid,
    addressBytes,
    protobufs.FarcasterNetwork.DEVNET,
    blockHashBytes
  )

  if (claimResult.isErr()) {
    console.error('Error making address claim', claimResult.error)
    return
  }

  const claim = claimResult.value

  // Sign the claim
  const ethSignResult = await eip712Signer.signVerificationEthAddressClaim(
    claim
  )
  const ethSignature = ethSignResult._unsafeUnwrap() // Safety: claim is known and can't error

  // Construct a Verification Add Message with the claim signature
  const verificationBody = {
    address: addressBytes,
    ethSignature,
    blockHash: blockHashBytes,
  }

  const verificationMessage = await makeVerificationAddEthAddress(
    verificationBody,
    dataOptions,
    ed25519Signer
  )

  if (verificationMessage.isErr()) {
    console.error(
      'Error making address verification',
      verificationMessage.error
    )
    return
  }

  const verificationAdd = verificationMessage.value

  const verificationAddMessage = await client.submitMessage(verificationAdd)

  if (verificationAddMessage.isErr()) {
    console.error(
      'Error submitting address verification',
      verificationAddMessage.error
    )
    return
  }
}

/**
 * Update profile picture
 * @param ed25519Signer Signer
 */
async function updatePfp(ed25519Signer: Ed25519Signer) {
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
async function createSigner() {
  const eip712Signer = new EthersEip712Signer(wallet)

  // Generate a new Ed25519 key pair which will become the Signer and store the private key securely
  const signerPrivateKey = ed.utils.randomPrivateKey()
  const ed25519Signer = new NobleEd25519Signer(signerPrivateKey)

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
 * Delete a signer. This will also revoke all messages made by the signer
 * @param ed25519Signer Signer
 */
async function deleteSigner(ed25519Signer: Ed25519Signer) {
  const eip712Signer = new EthersEip712Signer(wallet)

  const signerRemoveResult = await makeSignerRemove(
    { signer: (await ed25519Signer.getSignerKey())._unsafeUnwrap() },
    dataOptions,
    eip712Signer
  )

  // Submit the SignerRemove message to the Hub
  const signerRemove = signerRemoveResult._unsafeUnwrap()
  const result = await client.submitMessage(signerRemove)

  if (result.isErr()) {
    console.error(result.error)
  }
}

/**
 * Pause for a given number of seconds
 * @param seconds Number of seconds, default 2
 * @returns
 */
async function sleep(seconds?: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, seconds ? seconds * 1000 : 2000)
  )
}

/**
 * Send a series of test messages to the Hub
 */
export async function sendTestMessages() {
  await sleep()
  const signer = await createSigner()

  await sleep()
  const cast = await publishCast(signer)
  if (!cast) return

  await sleep()
  await likeCast(cast, signer)

  await sleep()
  await addVerification(signer)

  await sleep()
  await updatePfp(signer)

  await sleep()
  await unlikeCast(cast, signer)

  await sleep()
  await deleteCast(cast, signer)

  await sleep()
  await deleteSigner(signer)
}

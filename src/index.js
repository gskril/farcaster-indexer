import 'dotenv/config'
import got from 'got'
import cron from 'node-cron'
import abi from './registry-abi.js'
import { providers, Contract, utils } from 'ethers'
import { createClient } from '@supabase/supabase-js'

import {
  tokenAddress,
  getWalletValue,
  getProfileInfo,
  getEthPrice,
  getErc20Price,
} from './utils.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const provider = new providers.AlchemyProvider(
  'rinkeby',
  process.env.ALCHEMY_SECRET
)

const registryContract = new Contract(
  '0xe3Be01D99bAa8dB9905b33a3cA391238234B79D1',
  abi,
  provider
)

/**
 * Index all profiles in the Farcaster account registry and insert them into a Supabase table.
 */
async function indexCasts() {
  const startTime = Date.now()

  const allCasts = []
  let profilesIndexed = 0
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select()

  if (profilesError) {
    console.error(profilesError)
    return
  }

  if (!profiles) return
  console.log(`Indexing casts from ${profiles.length} profiles...`)

  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i]
    const name = profile.username

    const activity = await got(profile.address_activity)
      .json()
      .catch(() => {
        console.log(`Could not get activity for ${name}`)
        return null
      })

    if (!activity) continue

    // Remove deleted casts and recasts
    const cleanedActivity = activity.filter((cast) => {
      return (
        !cast.body.data.text.startsWith('delete:') &&
        !cast.body.data.text.startsWith('recast:')
      )
    })

    cleanedActivity.map((cast) => {
      allCasts.push({
        published_at: cast.body.publishedAt,
        sequence: cast.body.sequence,
        username: cast.body.username,
        address: cast.body.address,
        text: cast.body.data.text,
        reply_parent_merkle_root: cast.body.data.replyParentMerkleRoot || null,
        prev_merkle_root: cast.body.prevMerkleRoot || null,
        merkle_root: cast.merkleRoot,
        signature: cast.signature,
        display_name: cast.meta?.displayName || null,
        avatar: cast.meta?.avatar || null,
        is_verified_avatar: cast.meta?.isVerifiedAvatar || null,
        num_reply_children: cast.meta?.numReplyChildren || null,
        reactions: cast.meta?.reactions?.count || null,
        recasts: cast.meta?.recasts?.count || null,
        watches: cast.meta?.watches?.count || null,
        reply_parent_username: cast.meta?.replyParentUsername?.username || null,
      })
    })

    profilesIndexed++
  }

  const { count, error: upsertCastError } = await supabase
    .from('casts')
    .upsert(allCasts, {
      count: 'exact',
      onConflict: 'merkle_root',
    })

  if (upsertCastError) {
    console.error(upsertCastError)
    return
  }

  const endTime = Date.now()
  const secondsTaken = (endTime - startTime) / 1000
  console.log(
    `Saved ${count} casts from ${profilesIndexed} profiles in ${secondsTaken} seconds`
  )
}

/**
 * Index all profiles in the Farcaster account registry and insert them into a Supabase table.
 */
async function indexProfiles() {
  const allProfiles = []
  const startTime = Date.now()

  const numberOfProfiles = await registryContract
    .usernamesLength()
    .catch(() => {
      console.error('Error getting number of profiles from contract')
      return 0
    })

  if (numberOfProfiles === 0) return
  console.log(`Indexing ${numberOfProfiles} profiles...`)

  const ethPrice = await getEthPrice()
  const apePrice = await getErc20Price(tokenAddress.ape.id)
  const rplPrice = await getErc20Price(tokenAddress.rpl.id)
  const ensPrice = await getErc20Price(tokenAddress.ens.id)
  const stEthPrice = await getErc20Price(tokenAddress.stEth.id)

  for (let i = 0; i < numberOfProfiles; i++) {
    const byte32Name = await registryContract.usernameAtIndex(i).catch(() => {
      console.log(`Could not get username at index ${i}`)
      return null
    })

    if (!byte32Name) continue

    const username = utils.parseBytes32String(byte32Name)

    // Skip test accounts
    if (username.startsWith('__tt_')) continue

    // Get directory URL from contract
    const directoryUrl = await registryContract
      .getDirectoryUrl(byte32Name)
      .catch(() => {
        console.log(`Could not get directory url for ${username}`)
        return null
      })

    if (!directoryUrl || directoryUrl.includes('localhost')) continue

    // Get directory JSON from URL
    const directory = await got(directoryUrl)
      .json()
      .then((res) => {
        res.index = i
        res.username = username
        return res
      })
      .catch(() => {
        console.log(`Error getting directory for @${username} (${i})`)
        return null
      })

    if (!directory) continue

    // Add connected address to directory object
    directory.connectedAddress = await got(directory.body.proofUrl)
      .json()
      .then((res) => res.signerAddress)
      .catch(() => null)

    let walletBalance = null
    if (directory.connectedAddress) {
      walletBalance = await getWalletValue({
        address: directory.connectedAddress,
        ethPrice,
        apePrice,
        rplPrice,
        ensPrice,
        stEthPrice,
      })
    }

    const ethereumAddressRegex = /0x[a-fA-F0-9]{40}/
    let farcasterAddress = directoryUrl.match(ethereumAddressRegex)
    if (farcasterAddress) {
      farcasterAddress = farcasterAddress[0]
    }

    const profile = farcasterAddress
      ? await getProfileInfo(farcasterAddress)
      : null

    const formatted = {
      index: directory.index,
      merkle_root: directory.merkleRoot,
      signature: directory.signature || null,
      username: directory.username,
      display_name: profile?.name || null,
      followers: profile?.followers || null,
      address_activity: directory.body.addressActivityUrl,
      avatar: directory.body.avatarUrl || null,
      proof: directory.body.proofUrl,
      timestamp: directory.body.timestamp,
      version: directory.body.version,
      address: farcasterAddress,
      connected_address: directory.connectedAddress,
      wallet_balance: walletBalance,
    }

    allProfiles.push(formatted)
  }

  const { count: upsertedProfiles, error: upsertErr } = await supabase
    .from('profiles')
    .upsert(allProfiles, {
      onConflict: 'index',
      count: 'exact',
    })

  if (upsertErr) {
    console.log(allProfiles)
    console.error(upsertErr)
    return
  }

  const endTime = Date.now()
  const secondsTaken = (endTime - startTime) / 1000
  console.log(
    `Indexed ${upsertedProfiles} directories in ${secondsTaken} seconds`
  )
}

// Run job every 2 hours
cron.schedule('0 */2 * * *', () => {
  indexProfiles()
})

// Run job 30 mins
cron.schedule('*/30 * * * *', () => {
  indexCasts()
})

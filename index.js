import 'dotenv/config'
import got from 'got'
import cron from 'node-cron'
import abi from './registry-abi.js'
import { providers, Contract, utils } from 'ethers'
import { createClient } from '@supabase/supabase-js'

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

  for (let i = 10; i < profiles.length; i++) {
    if (i === 20) break

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
    // console.log(allCasts)
    return
  }

  const endTime = Date.now()
  const secondsTaken = (endTime - startTime) / 1000
  console.log(
    `Saved ${count} casts from ${profilesIndexed} profiles in ${secondsTaken} seconds`
  )
}

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

    const formatted = {
      index: directory.index,
      merkle_root: directory.merkleRoot,
      signature: directory.signature,
      username: directory.username,
      address_activity: directory.body.addressActivityUrl,
      avatar: directory.body.avatarUrl || null,
      proof: directory.body.proofUrl,
      timestamp: directory.body.timestamp,
      version: directory.body.version,
      connected_address: directory.connectedAddress,
    }

    allProfiles.push(formatted)
  }

  const { count: upsertedProfiles, error: upsertErr } = await supabase
    .from('profiles')
    .upsert(allProfiles, {
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

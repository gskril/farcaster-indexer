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

const tokenAddress = {
  stEth: {
    id: 'staked-ether',
    address: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
  },
  weth: {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
  usdc: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  usdt: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  dai: {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  },
  ape: {
    id: 'apecoin',
    address: '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
  },
  rpl: {
    id: 'rocket-pool',
    address: '0xD33526068D116cE69F19A9ee46F0bd304F21A51f',
  },
  ens: {
    id: 'ethereum-name-service',
    address: '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',
  },
}

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

/**
 * Get the value of certain tokens in an Ethereum wallet.
 * @param {string} address Ethereum address of the wallet
 * @param {number} ethPrice Current price of Ethereum in USD
 * @returns Value of the tokens in the wallet in USD
 */
async function getWalletValue({
  address,
  ethPrice,
  apePrice,
  rplPrice,
  ensPrice,
  stEthPrice,
}) {
  const ethBalance = await got(
    `https://api.etherscan.io/api?module=account&action=balancemulti&address=${address}&apikey=${process.env.ETHERSCAN_API_KEY}`
  )
    .json()
    .then((res) => res.result[0].balance / 1e18)

  const wethBalance = await getErc20Balance({
    address,
    tokenAddress: tokenAddress.weth.address,
    decimals: 1e18,
  })

  const usdtBalance = await getErc20Balance({
    address,
    tokenAddress: tokenAddress.usdt.address,
    decimals: 1e6,
  })

  const rplBalance = await getErc20Balance({
    address,
    tokenAddress: tokenAddress.rpl.address,
    decimals: 1e18,
  })

  const stEthBalance = await getErc20Balance({
    address,
    tokenAddress: tokenAddress.stEth.address,
    decimals: 1e18,
  })

  const apeBalance = await getErc20Balance({
    address,
    tokenAddress: tokenAddress.ape.address,
    decimals: 1e18,
  })

  const ensBalance = await getErc20Balance({
    address,
    tokenAddress: tokenAddress.ens.address,
    decimals: 1e18,
  })

  const usdcBalance = await getErc20Balance({
    address,
    tokenAddress: tokenAddress.usdc.address,
    decimals: 1e6,
  })

  const daiBalance = await getErc20Balance({
    address,
    tokenAddress: tokenAddress.dai.address,
    decimals: 1e18,
  })

  const ethValue = ethPrice * ethBalance
  const wethValue = ethPrice * wethBalance
  const rplValue = rplPrice * rplBalance
  const apeValue = apePrice * apeBalance
  const ensValue = ensPrice * ensBalance
  const stEthValue = stEthPrice * stEthBalance
  const stableCoinValue = usdcBalance + daiBalance + usdtBalance

  const nftValueEth = await getNftCollectionValue(address)
  const nftValue = ethPrice * nftValueEth

  const total = Math.floor(
    ethValue +
      wethValue +
      rplValue +
      apeValue +
      ensValue +
      stEthValue +
      stableCoinValue +
      nftValue
  )

  return total
}

/**
 * Get the display name and follower count of a Farcaster profile.
 * @param {string} address Farcaster account address
 * @returns {object} Object with a profile's display name and follower count
 */
async function getProfileInfo(farcasterAddress) {
  return await got(
    `https://api.farcaster.xyz/indexer/profiles/${farcasterAddress}`
  )
    .json()
    .then((res) => {
      return {
        name: res.user.displayName,
        followers: res.followStats.numFollowers,
      }
    })
}

/**
 * Get the price of ether in USD.
 * @returns {number} Current price of ether in USD
 */
async function getEthPrice() {
  return await got(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
  )
    .json()
    .then((res) => res.ethereum.usd)
}

/**
 * Get the price of an ERC-20 token in USD.
 * @param {string} coinId Coingecko ID of the token
 * @returns {number} Current price of the ERC-20 token in USD
 */
async function getErc20Price(coinId) {
  return await got(
    `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
  )
    .json()
    .then((res) => res[coinId].usd)
}

/**
 * Get the balance of an ERC-20 token in a wallet.
 * @param {string} address Ethereum address of the wallet
 * @param {string} tokenAddress Contract address of the ERC-20 token
 * @returns {number} Balance of the ERC-20 token in the wallet
 */
async function getErc20Balance({ address, tokenAddress, decimals }) {
  return await got(
    `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${address}&tag=latest&apikey=${process.env.ETHERSCAN_API_KEY}`
  )
    .json()
    .then((res) => {
      if (res.status === '0') {
        console.error('Error getting ERC-20 balance.', res.result)
        return 0
      } else {
        return res.result / decimals
      }
    })
}

/**
 * Get the estimated value of an NFT collection.
 * @param {*} address Ethereum address
 * @returns {number} Estimated value of the NFT collection in ETH
 */
async function getNftCollectionValue(address) {
  return await got(
    `https://api.opensea.io/api/v1/collections?asset_owner=${address}&offset=0&limit=300`
  )
    .json()
    .then((res) => {
      const nfts = res.map((collection) => {
        // return collection
        return {
          name: collection.primary_asset_contracts[0]?.name,
          price: collection.stats.one_day_average_price,
          count: collection.owned_asset_count,
        }
      })

      // Add total price of nfts
      const totalPrice = nfts.reduce((acc, curr) => {
        return acc + curr.price * curr.count
      }, 0)

      return totalPrice
    })
}

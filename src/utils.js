import got from 'got'

export const tokenAddress = {
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
 * Get the value of certain tokens in an Ethereum wallet.
 * @param {string} address Ethereum address of the wallet
 * @param {number} ethPrice Current price of Ethereum in USD
 * @returns Value of the tokens in the wallet in USD
 */
export async function getWalletValue({
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
export async function getProfileInfo(farcasterAddress) {
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
export async function getEthPrice() {
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
export async function getErc20Price(coinId) {
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
export async function getErc20Balance({ address, tokenAddress, decimals }) {
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
export async function getNftCollectionValue(address) {
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

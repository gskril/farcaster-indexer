import { createPublicClient, http, parseAbi } from 'viem'
import { optimism } from 'viem/chains'

export const opClient = createPublicClient({
  chain: optimism,
  transport: http(),
})

export const idRegistry = {
  address: '0x00000000Fc6c5F01Fc30151999387Bb99A9f489b',
  abi: parseAbi(['function idCounter() public view returns (uint256)']),
} as const

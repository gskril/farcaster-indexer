import { BaseContract } from 'ethers'
import { Provider } from '@ethersproject/providers'
import { FlattenedProfile } from '../types'

interface GetLogsParams {
  provider: Provider
  contract: BaseContract
  fromBlock?: number
}

export const getIdRegistryEvents = async ({
  provider,
  contract,
  fromBlock,
}: GetLogsParams) => {
  // Fetch Transfer or Register event logs emitted by IdRegistry
  const logs = await provider.getLogs({
    address: contract.address,
    fromBlock: fromBlock || 7648700,
    toBlock: 'latest',
    topics: [
      [
        '0x3cd6a0ffcc37406d9958e09bba79ff19d8237819eb2e1911f9edbce656499c87', // Register
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer
      ],
    ],
  })

  // Sort logs by chronologically by block number (note: does not sort within blocks)
  const sortedLogs = logs.sort((a, b) =>
    a.blockNumber > b.blockNumber ? 1 : -1
  )

  const registerEvents: FlattenedProfile[] = new Array()

  for (const logRecord of sortedLogs) {
    const logDesc = contract.interface.parseLog(logRecord)
    const id = logDesc.args.id
    const to = logDesc.args.to

    if (logDesc.name == 'Register') {
      registerEvents.push({
        id: Number(id),
        address: to,
      })
    }
  }

  return registerEvents
}

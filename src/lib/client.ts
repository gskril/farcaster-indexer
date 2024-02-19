import { getSSLHubRpcClient } from '@farcaster/hub-nodejs'

const HUB_RPC = process.env.HUB_RPC

if (!HUB_RPC) {
  throw new Error('HUB_RPC env variable is not set')
}

export const client = getSSLHubRpcClient(HUB_RPC)

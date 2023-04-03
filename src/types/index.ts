import * as protobufs from '@farcaster/protobufs'

type FarcasterNetwork = 'NONE' | 'MAINNET' | 'TESTNET' | 'DEVNET'

type MessageType =
  | 'MESSAGE_TYPE_NONE'
  | 'MESSAGE_TYPE_CAST_ADD'
  | 'MESSAGE_TYPE_CAST_REMOVE'
  | 'MESSAGE_TYPE_REACTION_ADD'
  | 'MESSAGE_TYPE_REACTION_REMOVE'
  | 'MESSAGE_TYPE_VERIFICATION_ADD_ETH_ADDRESS'
  | 'MESSAGE_TYPE_VERIFICATION_REMOVE'
  | 'MESSAGE_TYPE_SIGNER_ADD'
  | 'MESSAGE_TYPE_SIGNER_REMOVE'
  | 'MESSAGE_TYPE_USER_DATA_ADD'

export type MergeMessageHubEvent = {
  data: {
    type: MessageType
    fid: number
    timestamp: number
    network: FarcasterNetwork
    castAddBody?: {
      embeds: string[]
      mentions: number[]
      parentCastId?: {
        fid: number
        hash: string
      }
      text: string
      mentionsPositions: number[]
    }
    castRemoveBody?: {
      targetHash: string
    }
    reactionBody?: {
      type: protobufs.ReactionType
      targetCastId: {
        fid: number
        hash: string
      }
    }
    verificationAddEthAddressBody?: {
      address: string
      ethSignature: string
      blockHash: string
    }
    verificationRemoveBody?: {
      address: string
    }
    signerAddBody?: {
      signer: string
      name: string
    }
    userDataBody?: {
      type: string
      value: string
    }
    signerRemoveBody?: {
      signer: string
    }
  }
  hash: string
  hashScheme: protobufs.HashScheme
  signature: string
  signatureScheme: protobufs.SignatureScheme
  signer: string
}

export type PruneMessageHubEvent = MergeMessageHubEvent
export type RevokeMessageHubEvent = MergeMessageHubEvent

export type FormattedHubEvent = {
  id: number
  type: protobufs.HubEventType
  message: unknown
}

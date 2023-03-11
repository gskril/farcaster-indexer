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
      parentCastId: {
        fid: number
        hash: Uint8Array
      }
      text: string
      mentionsPositions: number[]
    }
    castRemoveBody?: {
      targetHash: Uint8Array
    }
    reactionBody?: {
      type: protobufs.ReactionType
      targetCastId: {
        fid: number
        hash: Uint8Array
      }
    }
    verificationAddEthAddressBody?: {
      address: Uint8Array
      ethSignature: Uint8Array
      blockHash: Uint8Array
    }
    verificationRemoveBody?: {
      address: Uint8Array
    }
    signerAddBody?: {
      signer: Uint8Array
      name: string
    }
    userDataBody?: {
      type: protobufs.UserDataType
      value: string
    }
    signerRemoveBody?: {
      signer: Uint8Array
    }
  }
  hash: Uint8Array
  hashScheme: protobufs.HashScheme
  signature: Uint8Array
  signatureScheme: protobufs.SignatureScheme
  signer: Uint8Array
}

export type PruneMessageHubEvent = MergeMessageHubEvent
export type RevokeMessageHubEvent = MergeMessageHubEvent

export type FormattedHubEvent = {
  type: protobufs.HubEventType
  message: unknown
}

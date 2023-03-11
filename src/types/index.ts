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

export interface MergeMessageHubEvent {
  data: {
    type: MessageType
    fid: number
    timestamp: number
    network: FarcasterNetwork
    castAddBody: protobufs.CastAddBody
  }
  hash: Uint8Array
  hashScheme: protobufs.HashScheme
  signature: Uint8Array
  signatureScheme: protobufs.SignatureScheme
  signer: Uint8Array
}

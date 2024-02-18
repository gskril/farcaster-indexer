import {
  HashScheme,
  IdRegisterEventType,
  MessageType,
  OnChainEventType,
  Protocol,
  ReactionType,
  SignatureScheme,
  SignerEventType,
  UserDataType,
  UserNameType,
} from '@farcaster/hub-nodejs'
import { ColumnType, Generated, GeneratedAlways } from 'kysely'

export type Fid = number
export type Hex = `0x${string}`

type CastIdJson = {
  fid: Fid
  hash: Hex
}

// CHAIN EVENTS -----------------------------------------------------------------------------------
declare const $chainEventDbId: unique symbol
type ChainEventDbId = string & { [$chainEventDbId]: true }

export type SignerEventBodyJson = {
  key: Hex
  keyType: number
  eventType: SignerEventType
  metadata: Hex
  metadataType: number
}

export type SignerMigratedEventBodyJson = {
  migratedAt: number
}

export type IdRegisterEventBodyJson = {
  to: Hex
  eventType: IdRegisterEventType
  from: Hex
  recoveryAddress: Hex
}

export type StorageRentEventBodyJson = {
  payer: Hex
  units: number
  expiry: number
}

export type ChainEventBodyJson =
  | SignerEventBodyJson
  | SignerMigratedEventBodyJson
  | IdRegisterEventBodyJson
  | StorageRentEventBodyJson

export type ChainEventRow = {
  id: GeneratedAlways<ChainEventDbId>
  createdAt: Generated<Date>
  blockTimestamp: Date
  fid: Fid
  chainId: number
  blockNumber: number
  transactionIndex: number
  logIndex: number
  type: OnChainEventType
  blockHash: Uint8Array
  transactionHash: Uint8Array
  body: ColumnType<ChainEventBodyJson, string, string>
  raw: Uint8Array
}

// FIDS -------------------------------------------------------------------------------------------
export type FidRow = {
  fid: Fid
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  registeredAt: Date
  chainEventId: ChainEventDbId
  custodyAddress: Uint8Array
  recoveryAddress: Uint8Array
}

// SIGNERS -----------------------------------------------------------------------------------------
declare const $signerDbId: unique symbol
type SignerDbId = string & { [$signerDbId]: true }

export type SignerAddMetadataJson = {
  requestFid: number
  requestSigner: Hex
  signature: Hex
  deadline: number
}

export type SignerRow = {
  id: GeneratedAlways<SignerDbId>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  addedAt: Date
  removedAt: Date | null
  fid: Fid
  requesterFid: Fid
  addChainEventId: ChainEventDbId
  removeChainEventId: ChainEventDbId | null
  key: Uint8Array
  keyType: number
  metadata: ColumnType<SignerAddMetadataJson, string, string>
  metadataType: number
}

// USERNAME PROOFS ---------------------------------------------------------------------------------
declare const $usernameProofDbId: unique symbol
type UsernameProofDbId = string & { [$usernameProofDbId]: true }

export type UsernameProofRow = {
  id: GeneratedAlways<UsernameProofDbId>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  timestamp: Date
  deletedAt: Date | null
  fid: Fid
  type: UserNameType
  username: string
  signature: Uint8Array
  owner: Uint8Array
}

// FNAMES ------------------------------------------------------------------------------------------
declare const $fnameDbId: unique symbol
type FnameDbId = string & { [$fnameDbId]: true }

export type FnameRow = {
  id: GeneratedAlways<FnameDbId>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  registeredAt: Date
  deletedAt: Date | null
  fid: Fid
  type: UserNameType
  username: string
}

// MESSAGES ---------------------------------------------------------------------------------------
declare const $messageDbId: unique symbol
type MessageDbId = string & { [$messageDbId]: true }

export type CastEmbedJson = { url: string } | { castId: CastIdJson }

export type CastAddBodyJson =
  | {
      text: string
      embeds?: CastEmbedJson[]
      mentions?: Fid[]
      mentionsPositions?: number[]
    }
  | { parentUrl: string }
  | { parentCastId: CastIdJson }

export type CastRemoveBodyJson = {
  targetHash: Hex
}

type ReactionBodyCastJson = {
  type: ReactionType
  targetCastId: CastIdJson
}

type ReactionBodyUrlJson = {
  type: ReactionType
  targetUrl: string
}

export type ReactionBodyJson = ReactionBodyCastJson | ReactionBodyUrlJson

export type VerificationAddEthAddressBodyJson = {
  address: Hex
  claimSignature: Hex
  blockHash: Hex
  protocol: Protocol
}

export type VerificationAddSolAddressBodyJson = {
  address: string
  claimSignature: string
  blockHash: string
  protocol: Protocol
}

export type VerificationRemoveBodyJson = {
  address: Hex
  protocol: Protocol
}

export type UserDataBodyJson = {
  type: UserDataType
  value: string
}

export type LinkBodyJson = {
  type: string
  /** original timestamp in Unix ms */
  displayTimestamp?: number
  targetFid?: Fid
}

export type UsernameProofBodyJson = {
  timestamp: number
  name: string
  owner: string
  signature: Hex
  fid: Fid
  type: UserNameType
}

export type MessageBodyJson =
  | CastAddBodyJson
  | CastRemoveBodyJson
  | ReactionBodyJson
  | LinkBodyJson
  | VerificationAddEthAddressBodyJson
  | VerificationAddSolAddressBodyJson
  | VerificationRemoveBodyJson
  | UserDataBodyJson
  | UsernameProofBodyJson

type MessageRow = {
  id: GeneratedAlways<MessageDbId>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  deletedAt: Date | null
  revokedAt: Date | null
  prunedAt: Date | null
  fid: Fid
  type: MessageType
  timestamp: Date
  hash: Uint8Array
  hashScheme: HashScheme
  signature: Uint8Array
  signatureScheme: SignatureScheme
  signer: Uint8Array
  raw: Uint8Array
  body: ColumnType<MessageBodyJson, string, string>
}

// CASTS -------------------------------------------------------------------------------------------
declare const $castDbId: unique symbol
type CastDbId = string & { [$castDbId]: true }

export type CastRow = {
  id: GeneratedAlways<CastDbId>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  timestamp: Date
  deletedAt: Date | null
  fid: Fid
  parentFid: Fid | null
  hash: Uint8Array
  rootParentHash: Uint8Array | null
  parentHash: Uint8Array | null
  rootParentUrl: string | null
  parentUrl: string | null
  text: string
  embeds: ColumnType<CastEmbedJson[], string, string>
  mentions: ColumnType<Fid[], string, string>
  mentionsPositions: ColumnType<number[], string, string>
}

// REACTIONS ---------------------------------------------------------------------------------------
declare const $reactionDbId: unique symbol
type ReactionDbId = string & { [$reactionDbId]: true }

export type ReactionRow = {
  id: GeneratedAlways<ReactionDbId>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  timestamp: Date
  deletedAt: Date | null
  fid: Fid
  targetCastFid: Fid | null
  type: ReactionType
  hash: Uint8Array
  targetCastHash: Uint8Array | null
  targetUrl: string | null
}

// LINKS -------------------------------------------------------------------------------------------
declare const $linkDbId: unique symbol
type LinkDbId = string & { [$linkDbId]: true }

export type LinkRow = {
  id: GeneratedAlways<LinkDbId>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  timestamp: Date
  deletedAt: Date | null
  fid: Fid
  targetFid: Fid | null
  displayTimestamp: Date | null
  type: string
  hash: Uint8Array
}

// VERIFICATIONS -----------------------------------------------------------------------------------
declare const $verificationDbId: unique symbol
type VerificationDbId = string & { [$verificationDbId]: true }

export type VerificationRow = {
  id: GeneratedAlways<VerificationDbId>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  timestamp: Date
  deletedAt: Date | null
  fid: Fid
  hash: Uint8Array
  signerAddress: Uint8Array
  blockHash: Uint8Array
  signature: Uint8Array
}

// USER DATA --------------------------------------------------------------------------------------
declare const $userDataDbId: unique symbol
type UserDataDbId = string & { [$userDataDbId]: true }

export type UserDataRow = {
  id: GeneratedAlways<UserDataDbId>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  timestamp: Date
  deletedAt: Date | null
  fid: Fid
  type: UserDataType
  hash: Uint8Array
  value: string
}

// STORAGE ALLOCATIONS -----------------------------------------------------------------------------
declare const $storageAllocationDbId: unique symbol
type StorageAllocationDbId = string & { [$storageAllocationDbId]: true }

type StorageAllocationRow = {
  id: GeneratedAlways<StorageAllocationDbId>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  rentedAt: Date
  expiresAt: Date
  chainEventId: ChainEventDbId
  fid: Fid
  units: number
  payer: Uint8Array
}

// ALL TABLES -------------------------------------------------------------------------------------
export interface Tables {
  usernameProofs: UsernameProofRow
  fnames: FnameRow
  messages: MessageRow
  chainEvents: ChainEventRow
  fids: FidRow
  signers: SignerRow
  casts: CastRow
  reactions: ReactionRow
  links: LinkRow
  verifications: VerificationRow
  userData: UserDataRow
  storageAllocations: StorageAllocationRow
}

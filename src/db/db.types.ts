import {
  HashScheme,
  MessageType,
  Protocol,
  ReactionType,
  SignatureScheme,
  UserDataType,
  UserNameType,
} from '@farcaster/hub-nodejs'
import { ColumnType, Generated, GeneratedAlways } from 'kysely'

type Fid = number
type Hex = `0x${string}`

type CastIdJson = {
  fid: Fid
  hash: Hex
}

// FNAMES ------------------------------------------------------------------------------------------
declare const $fnameDbId: unique symbol
type FnameDbId = string & { [$fnameDbId]: true }

type FnameRow = {
  id: GeneratedAlways<FnameDbId>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  registeredAt: Date
  deletedAt: Date | null
  fid: Fid
  type: UserNameType
  username: string
}

// CASTS -------------------------------------------------------------------------------------------
declare const $castDbId: unique symbol
type CastDbId = string & { [$castDbId]: true }

type CastEmbedJson = { url: string } | { castId: CastIdJson }

type CastRow = {
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

type ReactionRow = {
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

type LinkRow = {
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

type VerificationRow = {
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

// USER DATA ---------------------------------------------------------------------------------------
declare const $userDataDbId: unique symbol
type UserDataDbId = string & { [$userDataDbId]: true }

type UserDataRow = {
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

// EVENTS ------------------------------------------------------------------------------------------
type EventRow = {
  id: number
}

// ALL TABLES --------------------------------------------------------------------------------------
export interface Tables {
  fnames: FnameRow
  casts: CastRow
  reactions: ReactionRow
  links: LinkRow
  verifications: VerificationRow
  userData: UserDataRow
  events: EventRow
}

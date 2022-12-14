export interface MerkleResponse {
  result: {
    casts?: Cast[]
    users?: Profile[]
    verifications?: Verification[]
  }
  next?: {
    cursor: string
  }
}

interface PFP {
  url: string
  verified: boolean
}

interface ProfileCore {
  fid: number
  username: string
  displayName: string
  pfp?: PFP
}

export interface Profile {
  fid: number
  username: string
  displayName?: string
  pfp?: PFP
  profile: {
    bio: {
      text: string
      mentions: any[]
    }
  }
  followerCount: number
  followingCount: number
  referrerUsername?: string
}

export interface Cast {
  hash: string
  threadHash: string
  parentHash: string
  author: {
    fid: number
    username: string
    displayName: string
    pfp?: PFP
    profile?: {
      bio: {
        text: string
        mentions: Array<string>
      }
    }
    followerCount?: number
    followingCount?: number
  }
  text: string
  timestamp: number
  mentions?: ProfileCore[]
  replies: {
    count: number
  }
  reactions: {
    count: number
  }
  recasts: {
    count: number
    recasters: Array<any>
  }
  watches: {
    count: number
  }
  parentAuthor?: Profile
}

export interface Verification {
  fid: number
  address: string
  timestamp: number
}

export interface FlattenedProfile {
  id: number
  owner?: string
  username?: string
  display_name?: string | null
  avatar_url?: string | null
  avatar_verified?: boolean
  followers?: number
  following?: number
  bio?: string | null
  referrer?: string | null
  registered_at?: Date
  updated_at?: Date
}

export interface FlattenedCast {
  hash: string
  thread_hash: string
  parent_hash: string | null
  author_fid: number
  author_username: string
  author_display_name: string
  author_pfp_url: string | null
  author_pfp_verified: boolean | null
  text: string
  published_at: Date
  mentions: ProfileCore[] | null
  replies_count: number
  reactions_count: number
  recasts_count: number
  watches_count: number
  parent_author_fid: number | null
  parent_author_username: string | null
  deleted: boolean
}

export interface FlattenedVerification {
  fid: number
  address: string
  created_at: Date
}

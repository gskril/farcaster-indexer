export interface MerkleResponse {
  result: {
    casts?: Cast[]
    users?: Profile[]
  }
  next: {
    cursor: string
  }
}

export interface Profile {
  fid: number
  username: string
  displayName?: string
  pfp?: {
    url: string
    verified: boolean
  }
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
  author: {
    fid: number
    username: string
    displayName: string
    pfp: {
      url: string
      verified: boolean
    }
    profile: {
      bio: {
        text: string
        mentions: Array<string>
      }
    }
    followerCount: number
    followingCount: number
  }
  text: string
  timestamp: number
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
}

export interface Verification {
  fid: number
  address: string
  timestamp: number
}

export interface FlattenedProfile {
  id: number
  address?: string
  username?: string
  display_name?: string | null
  avatar_url?: string | null
  avatar_verified?: boolean
  followers?: number
  following?: number
  bio?: string | null
  referrer?: string | null
  connected_address?: string
  registered_at?: Date
  updated_at?: Date
}

export interface FlattenedCast {
  type: 'text-short'
  published_at: Date
  sequence: number
  address: string
  username: string
  text: string
  reply_parent_merkle_root: string | null
  prev_merkle_root: string | null
  signature: string
  merkle_root: string
  thread_merkle_root: string
  display_name: string | null
  avatar_url: string | null
  avatar_verified: boolean
  mentions: JSON | any
  num_reply_children: number | null
  reply_parent_username: string | null
  reply_parent_address: string | null
  reactions: number | null
  recasts: number | null
  watches: number | null
  recasters: JSON | any
  deleted: boolean
}

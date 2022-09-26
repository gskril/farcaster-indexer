export interface Profile {
  address: string
  username: string
  displayName: string
  avatar: {
    url: string
    isVerified: boolean
  }
  followerCount: number
  followingCount: number
  profile: {
    bio: {
      text: string
    }
    directMessageTargets: {
      telegram: string
    }
  }
  referrerUsername: string
}

export interface FlattenedProfile {
  id: number
  address: string
  username?: string
  display_name?: string
  avatar_url?: string
  avatar_verified?: boolean
  followers?: number
  following?: number
  bio?: string | null
  telegram?: string | null
  referrer?: string | null
  connected_address?: string
  registered_at?: Date
  updated_at?: Date
}

export interface Cast {
  body: {
    type: 'text-short'
    publishedAt: number
    sequence: number
    address: string
    username: string
    data: {
      text: string
      replyParentMerkleRoot: string
    }
    prevMerkleRoot: string
  }
  signature: string
  merkleRoot: string
  threadMerkleRoot: string
  meta: {
    displayName: string
    avatar: string
    isVerifiedAvatar: boolean
    mentions: {
      address: string
      username: string
    }[]
    numReplyChildren: number
    replyParentUsername: {
      address: string
      username: string
    }
    reactions: {
      count: number
    }
    recasters: Profile[]
    recasts: {
      count: number
    }
    watches: {
      count: number
    }
  }
}

export interface FlattenedCast {
  type: 'text-short'
  published_at: number
  sequence: number
  address: string
  username: string
  text: string
  reply_parent_merkle_root: string
  prev_merkle_root: string
  signature: string
  merkle_root: string
  thread_merkle_root: string
  display_name: string
  avatar_url: string
  avatar_verified: boolean
  mentions: JSON
  num_reply_children: number
  reply_parent_username: string
  reply_parent_address: string
  reactions: number
  recasts: number
  watches: number
  recasters: JSON
  deleted: boolean
}

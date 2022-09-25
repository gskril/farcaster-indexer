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

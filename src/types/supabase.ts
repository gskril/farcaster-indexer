export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      casts: {
        Row: {
          author_display_name: string | null
          author_fid: number
          author_pfp_url: string | null
          author_pfp_verified: boolean | null
          author_username: string | null
          deleted: boolean | null
          hash: string
          hash_v1: string | null
          mentions: Json | null
          parent_author_fid: number | null
          parent_author_username: string | null
          parent_hash: string | null
          parent_hash_v1: string | null
          published_at: Date
          reactions_count: number | null
          recasts_count: number | null
          replies_count: number | null
          text: string
          thread_hash: string
          thread_hash_v1: string | null
          watches_count: number | null
        }
        Insert: {
          author_display_name?: string | null
          author_fid: number
          author_pfp_url?: string | null
          author_pfp_verified?: boolean | null
          author_username?: string | null
          deleted?: boolean | null
          hash: string
          hash_v1?: string | null
          mentions?: Json | null
          parent_author_fid?: number | null
          parent_author_username?: string | null
          parent_hash?: string | null
          parent_hash_v1?: string | null
          published_at: Date
          reactions_count?: number | null
          recasts_count?: number | null
          replies_count?: number | null
          text: string
          thread_hash: string
          thread_hash_v1?: string | null
          watches_count?: number | null
        }
        Update: {
          author_display_name?: string | null
          author_fid?: number
          author_pfp_url?: string | null
          author_pfp_verified?: boolean | null
          author_username?: string | null
          deleted?: boolean | null
          hash?: string
          hash_v1?: string | null
          mentions?: Json | null
          parent_author_fid?: number | null
          parent_author_username?: string | null
          parent_hash?: string | null
          parent_hash_v1?: string | null
          published_at?: string
          reactions_count?: number | null
          recasts_count?: number | null
          replies_count?: number | null
          text?: string
          thread_hash?: string
          thread_hash_v1?: string | null
          watches_count?: number | null
        }
      }
      profile: {
        Row: {
          avatar_url: string | null
          avatar_verified: boolean | null
          bio: string | null
          display_name: string | null
          followers: number | null
          following: number | null
          id: number
          owner: string | null
          referrer: string | null
          registered_at: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          avatar_verified?: boolean | null
          bio?: string | null
          display_name?: string | null
          followers?: number | null
          following?: number | null
          id: number
          owner?: string | null
          referrer?: string | null
          registered_at?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          avatar_verified?: boolean | null
          bio?: string | null
          display_name?: string | null
          followers?: number | null
          following?: number | null
          id?: number
          owner?: string | null
          referrer?: string | null
          registered_at?: string | null
          updated_at?: string | null
          username?: string | null
        }
      }
      verification: {
        Row: {
          address: string
          created_at: string | null
          fid: number
        }
        Insert: {
          address: string
          created_at?: string | null
          fid: number
        }
        Update: {
          address?: string
          created_at?: string | null
          fid?: number
        }
      }
    }
    Views: {
      profile_with_verification: {
        Row: {
          avatar_url: string | null
          avatar_verified: boolean | null
          bio: string | null
          display_name: string | null
          followers: number | null
          following: number | null
          id: number | null
          owner: string | null
          referrer: string | null
          registered_at: string | null
          updated_at: string | null
          username: string | null
          verifications: Json | null
        }
      }
    }
    Functions: {
      casts_regex: {
        Args: {
          regex: string
        }
        Returns: {
          author_display_name: string | null
          author_fid: number
          author_pfp_url: string | null
          author_pfp_verified: boolean | null
          author_username: string | null
          deleted: boolean | null
          hash: string
          hash_v1: string | null
          mentions: Json | null
          parent_author_fid: number | null
          parent_author_username: string | null
          parent_hash: string | null
          parent_hash_v1: string | null
          published_at: Date
          reactions_count: number | null
          recasts_count: number | null
          replies_count: number | null
          text: string
          thread_hash: string
          thread_hash_v1: string | null
          watches_count: number | null
        }[]
      }
      get_profile_by_address: {
        Args: {
          connected_address: string
        }
        Returns: {
          avatar_url: string | null
          avatar_verified: boolean | null
          bio: string | null
          display_name: string | null
          followers: number | null
          following: number | null
          id: number
          owner: string | null
          referrer: string | null
          registered_at: string | null
          updated_at: string | null
          username: string | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

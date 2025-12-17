export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          code: string
          description: string
          id: string
          image_url: string | null
          name: string
          points: number | null
        }
        Insert: {
          code: string
          description: string
          id?: string
          image_url?: string | null
          name: string
          points?: number | null
        }
        Update: {
          code?: string
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          points?: number | null
        }
        Relationships: []
      }
      broadcasts: {
        Row: {
          blob_commitment: string | null
          content_hash: string
          content_type: string
          created_at: string | null
          dj_address: string
          duration: number
          id: string
          ipfs_hash: string | null
          is_locked: boolean | null
          station_id: string | null
          title: string
          unlock_time: string | null
        }
        Insert: {
          blob_commitment?: string | null
          content_hash: string
          content_type: string
          created_at?: string | null
          dj_address: string
          duration: number
          id?: string
          ipfs_hash?: string | null
          is_locked?: boolean | null
          station_id?: string | null
          title: string
          unlock_time?: string | null
        }
        Update: {
          blob_commitment?: string | null
          content_hash?: string
          content_type?: string
          created_at?: string | null
          dj_address?: string
          duration?: number
          id?: string
          ipfs_hash?: string | null
          is_locked?: boolean | null
          station_id?: string | null
          title?: string
          unlock_time?: string | null
        }
        Relationships: []
      }
      stations: {
        Row: {
          category: string
          contract_address: string | null
          created_at: string | null
          description: string | null
          frequency: number
          id: string
          image_url: string | null
          is_live: boolean | null
          is_premium: boolean | null
          listener_count: number | null
          name: string
          owner_address: string
          signal_strength: number | null
          subscription_fee: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          contract_address?: string | null
          created_at?: string | null
          description?: string | null
          frequency: number
          id?: string
          image_url?: string | null
          is_live?: boolean | null
          is_premium?: boolean | null
          listener_count?: number | null
          name: string
          owner_address: string
          signal_strength?: number | null
          subscription_fee?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          contract_address?: string | null
          created_at?: string | null
          description?: string | null
          frequency?: number
          id?: string
          image_url?: string | null
          is_live?: boolean | null
          is_premium?: boolean | null
          listener_count?: number | null
          name?: string
          owner_address?: string
          signal_strength?: number | null
          subscription_fee?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tips: {
        Row: {
          amount: number
          created_at: string | null
          from_address: string
          id: string
          station_id: string | null
          to_address: string
          tx_hash: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          from_address: string
          id?: string
          station_id?: string | null
          to_address: string
          tx_hash: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          from_address?: string
          id?: string
          station_id?: string | null
          to_address?: string
          tx_hash?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          audio_mode: string | null
          avatar_url: string | null
          base_name: string | null
          created_at: string | null
          equalizer_bass: number | null
          equalizer_mid: number | null
          equalizer_treble: number | null
          farcaster_fid: number | null
          farcaster_username: string | null
          id: string
          language: string | null
          last_active: string | null
          volume: number | null
          wallet_address: string
        }
        Insert: {
          audio_mode?: string | null
          avatar_url?: string | null
          base_name?: string | null
          created_at?: string | null
          equalizer_bass?: number | null
          equalizer_mid?: number | null
          equalizer_treble?: number | null
          farcaster_fid?: number | null
          farcaster_username?: string | null
          id?: string
          language?: string | null
          last_active?: string | null
          volume?: number | null
          wallet_address: string
        }
        Update: {
          audio_mode?: string | null
          avatar_url?: string | null
          base_name?: string | null
          created_at?: string | null
          equalizer_bass?: number | null
          equalizer_mid?: number | null
          equalizer_treble?: number | null
          farcaster_fid?: number | null
          farcaster_username?: string | null
          id?: string
          language?: string | null
          last_active?: string | null
          volume?: number | null
          wallet_address?: string
        }
        Relationships: []
      }
      live_chat: {
        Row: {
          created_at: string | null
          id: string
          message: string
          station_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          station_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          station_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vibes_reactions: {
        Row: {
          created_at: string | null
          id: string
          mood: string
          station_id: string | null
          user_id: string | null
          vibes_earned: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          mood: string
          station_id?: string | null
          user_id?: string | null
          vibes_earned: number
        }
        Update: {
          created_at?: string | null
          id?: string
          mood?: string
          station_id?: string | null
          user_id?: string | null
          vibes_earned?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience types
export type Station = Tables<'stations'>
export type User = Tables<'users'>
export type Broadcast = Tables<'broadcasts'>
export type Tip = Tables<'tips'>
export type LiveChat = Tables<'live_chat'>
export type VibesReaction = Tables<'vibes_reactions'>
export type Achievement = Tables<'achievements'>

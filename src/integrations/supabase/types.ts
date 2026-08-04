export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          alert_on_failed_runs: boolean
          apify_token_configured: boolean
          display_name: string
          email: string | null
          id: boolean
          updated_at: string
          weekly_digest: boolean
        }
        Insert: {
          alert_on_failed_runs?: boolean
          apify_token_configured?: boolean
          display_name?: string
          email?: string | null
          id?: boolean
          updated_at?: string
          weekly_digest?: boolean
        }
        Update: {
          alert_on_failed_runs?: boolean
          apify_token_configured?: boolean
          display_name?: string
          email?: string | null
          id?: boolean
          updated_at?: string
          weekly_digest?: boolean
        }
        Relationships: []
      }
      calendar_items: {
        Row: {
          created_at: string
          format: Database["public"]["Enums"]["content_type"]
          id: string
          platform: Database["public"]["Enums"]["platform"]
          scheduled_for: string
          status: Database["public"]["Enums"]["plan_status"]
          suggestion_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          format: Database["public"]["Enums"]["content_type"]
          id?: string
          platform: Database["public"]["Enums"]["platform"]
          scheduled_for: string
          status?: Database["public"]["Enums"]["plan_status"]
          suggestion_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          format?: Database["public"]["Enums"]["content_type"]
          id?: string
          platform?: Database["public"]["Enums"]["platform"]
          scheduled_for?: string
          status?: Database["public"]["Enums"]["plan_status"]
          suggestion_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_items_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          active: boolean
          added_date: string
          handle: string
          id: string
          name: string
          niche_tags: string[]
          notes: string | null
          platform: Database["public"]["Enums"]["platform"]
          profile_url: string | null
        }
        Insert: {
          active?: boolean
          added_date?: string
          handle: string
          id?: string
          name: string
          niche_tags?: string[]
          notes?: string | null
          platform: Database["public"]["Enums"]["platform"]
          profile_url?: string | null
        }
        Update: {
          active?: boolean
          added_date?: string
          handle?: string
          id?: string
          name?: string
          niche_tags?: string[]
          notes?: string | null
          platform?: Database["public"]["Enums"]["platform"]
          profile_url?: string | null
        }
        Relationships: []
      }
      ingestion_runs: {
        Row: {
          actor_id: string | null
          competitor_id: string | null
          id: string
          items_returned: number
          message: string | null
          platform: Database["public"]["Enums"]["platform"]
          started_at: string
          status: Database["public"]["Enums"]["run_status"]
        }
        Insert: {
          actor_id?: string | null
          competitor_id?: string | null
          id?: string
          items_returned?: number
          message?: string | null
          platform: Database["public"]["Enums"]["platform"]
          started_at?: string
          status?: Database["public"]["Enums"]["run_status"]
        }
        Update: {
          actor_id?: string | null
          competitor_id?: string | null
          id?: string
          items_returned?: number
          message?: string | null
          platform?: Database["public"]["Enums"]["platform"]
          started_at?: string
          status?: Database["public"]["Enums"]["run_status"]
        }
        Relationships: [
          {
            foreignKeyName: "ingestion_runs_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics: {
        Row: {
          comments: number
          engagement_rate: number | null
          last_updated: string
          likes: number
          post_id: string
          saves: number
          shares: number
          views: number
        }
        Insert: {
          comments?: number
          engagement_rate?: number | null
          last_updated?: string
          likes?: number
          post_id: string
          saves?: number
          shares?: number
          views?: number
        }
        Update: {
          comments?: number
          engagement_rate?: number | null
          last_updated?: string
          likes?: number
          post_id?: string
          saves?: number
          shares?: number
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "metrics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_configs: {
        Row: {
          actor_id: string | null
          enabled: boolean
          last_run_status: Database["public"]["Enums"]["run_status"] | null
          last_success_at: string | null
          platform: Database["public"]["Enums"]["platform"]
          schedule_hours: number
          updated_at: string
        }
        Insert: {
          actor_id?: string | null
          enabled?: boolean
          last_run_status?: Database["public"]["Enums"]["run_status"] | null
          last_success_at?: string | null
          platform: Database["public"]["Enums"]["platform"]
          schedule_hours?: number
          updated_at?: string
        }
        Update: {
          actor_id?: string | null
          enabled?: boolean
          last_run_status?: Database["public"]["Enums"]["run_status"] | null
          last_success_at?: string | null
          platform?: Database["public"]["Enums"]["platform"]
          schedule_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          caption_text: string | null
          competitor_id: string
          content_type: Database["public"]["Enums"]["content_type"]
          id: string
          platform: Database["public"]["Enums"]["platform"]
          post_url: string
          posted_at: string
          pulled_at: string
          thumbnail_url: string | null
        }
        Insert: {
          caption_text?: string | null
          competitor_id: string
          content_type: Database["public"]["Enums"]["content_type"]
          id?: string
          platform: Database["public"]["Enums"]["platform"]
          post_url: string
          posted_at?: string
          pulled_at?: string
          thumbnail_url?: string | null
        }
        Update: {
          caption_text?: string | null
          competitor_id?: string
          content_type?: Database["public"]["Enums"]["content_type"]
          id?: string
          platform?: Database["public"]["Enums"]["platform"]
          post_url?: string
          posted_at?: string
          pulled_at?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestions: {
        Row: {
          based_on_post_id: string | null
          created_at: string
          id: string
          rationale_text: string
          score_breakdown: Json
          status: Database["public"]["Enums"]["plan_status"]
          success_probability: number
          suggested_format: Database["public"]["Enums"]["content_type"]
          suggested_platform: Database["public"]["Enums"]["platform"]
          suggested_topic: string
        }
        Insert: {
          based_on_post_id?: string | null
          created_at?: string
          id?: string
          rationale_text: string
          score_breakdown?: Json
          status?: Database["public"]["Enums"]["plan_status"]
          success_probability?: number
          suggested_format: Database["public"]["Enums"]["content_type"]
          suggested_platform: Database["public"]["Enums"]["platform"]
          suggested_topic: string
        }
        Update: {
          based_on_post_id?: string | null
          created_at?: string
          id?: string
          rationale_text?: string
          score_breakdown?: Json
          status?: Database["public"]["Enums"]["plan_status"]
          success_probability?: number
          suggested_format?: Database["public"]["Enums"]["content_type"]
          suggested_platform?: Database["public"]["Enums"]["platform"]
          suggested_topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_based_on_post_id_fkey"
            columns: ["based_on_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      content_type: "reel" | "short" | "carousel" | "post" | "video" | "thread"
      plan_status: "idea" | "planned" | "posted"
      platform: "youtube" | "facebook" | "instagram" | "x" | "reddit" | "tiktok"
      run_status: "success" | "failed" | "running" | "empty"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      content_type: ["reel", "short", "carousel", "post", "video", "thread"],
      plan_status: ["idea", "planned", "posted"],
      platform: ["youtube", "facebook", "instagram", "x", "reddit", "tiktok"],
      run_status: ["success", "failed", "running", "empty"],
    },
  },
} as const

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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bids: {
        Row: {
          amount: number
          created_at: string | null
          estimated_hours: number | null
          helper_id: string
          id: string
          message: string | null
          status: Database["public"]["Enums"]["bid_status"] | null
          task_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          estimated_hours?: number | null
          helper_id: string
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["bid_status"] | null
          task_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          estimated_hours?: number | null
          helper_id?: string
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["bid_status"] | null
          task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bids_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          compensation_amount: number | null
          created_at: string
          id: string
          raised_by: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          status: string
          task_id: string
        }
        Insert: {
          compensation_amount?: number | null
          created_at?: string
          id?: string
          raised_by: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          task_id: string
        }
        Update: {
          compensation_amount?: number | null
          created_at?: string
          id?: string
          raised_by?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      helper_skills: {
        Row: {
          certification: string | null
          created_at: string
          helper_id: string
          id: string
          skill_id: string
          years_experience: number | null
        }
        Insert: {
          certification?: string | null
          created_at?: string
          helper_id: string
          id?: string
          skill_id: string
          years_experience?: number | null
        }
        Update: {
          certification?: string | null
          created_at?: string
          helper_id?: string
          id?: string
          skill_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "helper_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string
          gender: string | null
          hourly_rate: number | null
          id: string
          is_identity_verified: boolean | null
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name: string
          gender?: string | null
          hourly_rate?: number | null
          id: string
          is_identity_verified?: boolean | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string
          gender?: string | null
          hourly_rate?: number | null
          id?: string
          is_identity_verified?: boolean | null
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      task_photos: {
        Row: {
          created_at: string
          id: string
          photo_url: string
          task_id: string
          type: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_url: string
          task_id: string
          type: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_url?: string
          task_id?: string
          type?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_photos_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_required_skills: {
        Row: {
          id: string
          skill_id: string
          task_id: string
        }
        Insert: {
          id?: string
          skill_id: string
          task_id: string
        }
        Update: {
          id?: string
          skill_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_required_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_required_skills_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_helper_id: string | null
          budget_max: number | null
          budget_min: number | null
          category: string
          created_at: string | null
          deadline: string | null
          description: string
          face_scan_at: string | null
          face_scan_verified: boolean | null
          id: string
          location_address: string
          location_lat: number
          location_lng: number
          status: Database["public"]["Enums"]["task_status"] | null
          tasker_id: string
          title: string
          updated_at: string | null
          winning_bid_id: string | null
        }
        Insert: {
          assigned_helper_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          category: string
          created_at?: string | null
          deadline?: string | null
          description: string
          face_scan_at?: string | null
          face_scan_verified?: boolean | null
          id?: string
          location_address: string
          location_lat: number
          location_lng: number
          status?: Database["public"]["Enums"]["task_status"] | null
          tasker_id: string
          title: string
          updated_at?: string | null
          winning_bid_id?: string | null
        }
        Update: {
          assigned_helper_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          category?: string
          created_at?: string | null
          deadline?: string | null
          description?: string
          face_scan_at?: string | null
          face_scan_verified?: boolean | null
          id?: string
          location_address?: string
          location_lat?: number
          location_lng?: number
          status?: Database["public"]["Enums"]["task_status"] | null
          tasker_id?: string
          title?: string
          updated_at?: string | null
          winning_bid_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          dispute_id: string | null
          helper_id: string
          helper_payout: number
          id: string
          payment_id: string | null
          payment_status: string | null
          platform_fee: number
          task_id: string
          tasker_id: string
          type: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          dispute_id?: string | null
          helper_id: string
          helper_payout: number
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          platform_fee: number
          task_id: string
          tasker_id: string
          type?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          dispute_id?: string | null
          helper_id?: string
          helper_payout?: number
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          platform_fee?: number
          task_id?: string
          tasker_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      verifications: {
        Row: {
          created_at: string
          document_url: string | null
          id: string
          notes: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          document_url?: string | null
          id?: string
          notes?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          document_url?: string | null
          id?: string
          notes?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
          verification_bonus_claimed: boolean
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          verification_bonus_claimed?: boolean
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          verification_bonus_claimed?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_profile: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          full_name: string
          id: string
          is_identity_verified: boolean
        }[]
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      bid_status: "pending" | "accepted" | "rejected"
      task_status:
        | "open"
        | "bidding"
        | "assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
      user_role: "tasker" | "helper" | "admin"
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
      bid_status: ["pending", "accepted", "rejected"],
      task_status: [
        "open",
        "bidding",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
      ],
      user_role: ["tasker", "helper", "admin"],
    },
  },
} as const

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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          banner_url: string | null
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          is_pinned: boolean
          title: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_pinned?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          is_pinned?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          new_value: Json | null
          old_value: Json | null
          reason: string | null
          target_id: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          target_id: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          reason?: string | null
          target_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          metadata: Json | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_cache: {
        Row: {
          attempts: number
          code_hash: string
          expires_at: string
          locked_until: string | null
          phone: string
        }
        Insert: {
          attempts?: number
          code_hash: string
          expires_at: string
          locked_until?: string | null
          phone: string
        }
        Update: {
          attempts?: number
          code_hash?: string
          expires_at?: string
          locked_until?: string | null
          phone?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number
          ban_reason: string | null
          checkin_streak: number
          created_at: string
          daily_revenue: number
          deleted_at: string | null
          display_name: string | null
          failed_login_attempts: number
          id: string
          is_admin: boolean
          is_banned: boolean
          last_checkin: string | null
          last_login_at: string | null
          last_login_ip: string | null
          last_lucky_bag: string | null
          locked_until: string | null
          monthly_revenue: number
          phone: string
          referral_code: string
          referred_by: string | null
          total_income: number
          total_profit: number
          total_withdrawals: number
          updated_at: string
          vip_level: string
          vip_upgraded_at: string | null
          work_deposit: number
        }
        Insert: {
          avatar_url?: string | null
          balance?: number
          ban_reason?: string | null
          checkin_streak?: number
          created_at?: string
          daily_revenue?: number
          deleted_at?: string | null
          display_name?: string | null
          failed_login_attempts?: number
          id: string
          is_admin?: boolean
          is_banned?: boolean
          last_checkin?: string | null
          last_login_at?: string | null
          last_login_ip?: string | null
          last_lucky_bag?: string | null
          locked_until?: string | null
          monthly_revenue?: number
          phone: string
          referral_code: string
          referred_by?: string | null
          total_income?: number
          total_profit?: number
          total_withdrawals?: number
          updated_at?: string
          vip_level?: string
          vip_upgraded_at?: string | null
          work_deposit?: number
        }
        Update: {
          avatar_url?: string | null
          balance?: number
          ban_reason?: string | null
          checkin_streak?: number
          created_at?: string
          daily_revenue?: number
          deleted_at?: string | null
          display_name?: string | null
          failed_login_attempts?: number
          id?: string
          is_admin?: boolean
          is_banned?: boolean
          last_checkin?: string | null
          last_login_at?: string | null
          last_login_ip?: string | null
          last_lucky_bag?: string | null
          locked_until?: string | null
          monthly_revenue?: number
          phone?: string
          referral_code?: string
          referred_by?: string | null
          total_income?: number
          total_profit?: number
          total_withdrawals?: number
          updated_at?: string
          vip_level?: string
          vip_upgraded_at?: string | null
          work_deposit?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_vip_level_fkey"
            columns: ["vip_level"]
            isOneToOne: false
            referencedRelation: "vip_levels"
            referencedColumns: ["name"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          paid_at: string | null
          referred_id: string
          referrer_id: string
          reward_amount: number
          reward_paid: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          paid_at?: string | null
          referred_id: string
          referrer_id: string
          reward_amount?: number
          reward_paid?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          paid_at?: string | null
          referred_id?: string
          referrer_id?: string
          reward_amount?: number
          reward_paid?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_logs: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          reward_earned: number
          session_id: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          reward_earned: number
          session_id: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          reward_earned?: number
          session_id?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "task_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_sessions: {
        Row: {
          completed: boolean
          created_at: string
          expires_at: string
          id: string
          started_at: string
          tab_active_seconds: number
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          expires_at?: string
          id?: string
          started_at?: string
          tab_active_seconds?: number
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          expires_at?: string
          id?: string
          started_at?: string
          tab_active_seconds?: number
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          facebook_url: string
          id: string
          is_active: boolean
          min_vip_sort: number
          reward: number
          title: string
          updated_at: string
          wait_seconds: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          facebook_url: string
          id?: string
          is_active?: boolean
          min_vip_sort?: number
          reward: number
          title?: string
          updated_at?: string
          wait_seconds?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          facebook_url?: string
          id?: string
          is_active?: boolean
          min_vip_sort?: number
          reward?: number
          title?: string
          updated_at?: string
          wait_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          admin_id: string | null
          amount: number
          created_at: string
          direction: Database["public"]["Enums"]["transaction_direction"]
          id: string
          metadata: Json | null
          paystack_reference: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          amount: number
          created_at?: string
          direction: Database["public"]["Enums"]["transaction_direction"]
          id?: string
          metadata?: Json | null
          paystack_reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          admin_id?: string | null
          amount?: number
          created_at?: string
          direction?: Database["public"]["Enums"]["transaction_direction"]
          id?: string
          metadata?: Json | null
          paystack_reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vip_levels: {
        Row: {
          color_hex: string
          created_at: string
          daily_tasks: number
          name: string
          reward_per_task: number
          sort_order: number
          updated_at: string
          upgrade_cost: number | null
        }
        Insert: {
          color_hex?: string
          created_at?: string
          daily_tasks: number
          name: string
          reward_per_task: number
          sort_order: number
          updated_at?: string
          upgrade_cost?: number | null
        }
        Update: {
          color_hex?: string
          created_at?: string
          daily_tasks?: number
          name?: string
          reward_per_task?: number
          sort_order?: number
          updated_at?: string
          upgrade_cost?: number | null
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          admin_note: string | null
          amount: number
          channel: Database["public"]["Enums"]["withdrawal_channel"]
          created_at: string
          details: Json
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["withdrawal_status"]
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          channel: Database["public"]["Enums"]["withdrawal_channel"]
          created_at?: string
          details: Json
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          channel?: Database["public"]["Enums"]["withdrawal_channel"]
          created_at?: string
          details?: Json
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"]
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawals_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_otps: { Args: never; Returns: undefined }
      deduct_balance: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      get_my_withdrawals: {
        Args: { limit_count?: number }
        Returns: {
          admin_note: string
          amount: number
          channel: string
          created_at: string
          details: Json
          id: string
          reviewed_at: string
          status: string
        }[]
      }
      get_public_recent_payouts: {
        Args: { limit_count?: number }
        Returns: {
          amount: number
          channel: string
          created_at: string
          id: string
          masked_name: string
          masked_phone: string
          network: string
          reviewed_at: string
          status: string
        }[]
      }
      get_total_balance: { Args: never; Returns: number }
      get_total_daily_revenue: { Args: never; Returns: number }
      get_total_deposits: { Args: never; Returns: number }
      increment_balance: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      increment_work_deposit: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      refund_balance: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      reset_all_daily_revenue: { Args: never; Returns: undefined }
      reset_all_monthly_revenue: { Args: never; Returns: undefined }
    }
    Enums: {
      notification_type:
        | "task_reward"
        | "deposit"
        | "withdrawal_update"
        | "vip_upgrade"
        | "lucky_bag"
        | "daily_checkin"
        | "referral_bonus"
        | "announcement"
        | "admin_message"
      transaction_direction: "+" | "-"
      transaction_status: "pending" | "success" | "failed" | "reversed"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "task_reward"
        | "vip_upgrade"
        | "lucky_bag"
        | "daily_checkin"
        | "referral_bonus"
        | "admin_adjustment"
      withdrawal_channel: "mobile_money" | "bank"
      withdrawal_status: "pending" | "approved" | "rejected" | "cancelled"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      notification_type: [
        "task_reward",
        "deposit",
        "withdrawal_update",
        "vip_upgrade",
        "lucky_bag",
        "daily_checkin",
        "referral_bonus",
        "announcement",
        "admin_message",
      ],
      transaction_direction: ["+", "-"],
      transaction_status: ["pending", "success", "failed", "reversed"],
      transaction_type: [
        "deposit",
        "withdrawal",
        "task_reward",
        "vip_upgrade",
        "lucky_bag",
        "daily_checkin",
        "referral_bonus",
        "admin_adjustment",
      ],
      withdrawal_channel: ["mobile_money", "bank"],
      withdrawal_status: ["pending", "approved", "rejected", "cancelled"],
    },
  },
} as const

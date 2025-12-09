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
      catalogs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          product_limit: number | null
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          product_limit?: number | null
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          product_limit?: number | null
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      escrow_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          customer_email: string | null
          escrow_account_code: string | null
          id: string
          order_id: string | null
          payment_reference: string | null
          release_amount: number | null
          release_to_subaccount: string | null
          released_at: string | null
          status: string | null
          transaction_reference: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          escrow_account_code?: string | null
          id?: string
          order_id?: string | null
          payment_reference?: string | null
          release_amount?: number | null
          release_to_subaccount?: string | null
          released_at?: string | null
          status?: string | null
          transaction_reference: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          customer_email?: string | null
          escrow_account_code?: string | null
          id?: string
          order_id?: string | null
          payment_reference?: string | null
          release_amount?: number | null
          release_to_subaccount?: string | null
          released_at?: string | null
          status?: string | null
          transaction_reference?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          guest_id: string | null
          id: string
          session_id: string | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          guest_id?: string | null
          id?: string
          session_id?: string | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          guest_id?: string | null
          id?: string
          session_id?: string | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      income_split_configs: {
        Row: {
          created_at: string | null
          fee_bearer: boolean | null
          fee_percentage: number | null
          id: string
          order_id: string | null
          split_percentage: number
          status: string | null
          subaccount_code: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          fee_bearer?: boolean | null
          fee_percentage?: number | null
          id?: string
          order_id?: string | null
          split_percentage: number
          status?: string | null
          subaccount_code: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          fee_bearer?: boolean | null
          fee_percentage?: number | null
          id?: string
          order_id?: string | null
          split_percentage?: number
          status?: string | null
          subaccount_code?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "income_split_configs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          reference: string
          seller_id: string
          subaccount_code: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference: string
          seller_id: string
          subaccount_code: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference?: string
          seller_id?: string
          subaccount_code?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_at_purchase: number
          product_id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price_at_purchase: number
          product_id: string
          quantity: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_at_purchase?: number
          product_id?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_logs: {
        Row: {
          created_at: string
          id: string
          new_payment_status: string
          new_status: string
          order_id: string
          previous_payment_status: string
          previous_status: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_payment_status: string
          new_status: string
          order_id: string
          previous_payment_status: string
          previous_status: string
        }
        Update: {
          created_at?: string
          id?: string
          new_payment_status?: string
          new_status?: string
          order_id?: string
          previous_payment_status?: string
          previous_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          catalog_id: string
          created_at: string
          customer_address: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_notes: string | null
          escrow_status: string | null
          guest_id: string | null
          id: string
          is_guest_order: boolean | null
          monnify_transaction_reference: string | null
          notes: string | null
          payment_date: string | null
          payment_provider: string | null
          payment_reference: string | null
          payment_status: string | null
          release_date: string | null
          social_media_source: string | null
          status: string
          total_amount: number
          transaction_reference: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          catalog_id: string
          created_at?: string
          customer_address?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_notes?: string | null
          escrow_status?: string | null
          guest_id?: string | null
          id?: string
          is_guest_order?: boolean | null
          monnify_transaction_reference?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          release_date?: string | null
          social_media_source?: string | null
          status?: string
          total_amount: number
          transaction_reference?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          catalog_id?: string
          created_at?: string
          customer_address?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_notes?: string | null
          escrow_status?: string | null
          guest_id?: string | null
          id?: string
          is_guest_order?: boolean | null
          monnify_transaction_reference?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          release_date?: string | null
          social_media_source?: string | null
          status?: string
          total_amount?: number
          transaction_reference?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalogs"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_accounts: {
        Row: {
          account_name: string
          account_number: string
          bank_code: string
          bank_name: string
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_code: string
          bank_name: string
          created_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_code?: string
          bank_name?: string
          created_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_accounts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          account_name: string
          account_number: string
          amount: number
          bank_name: string
          created_at: string | null
          fee: number
          id: string
          net_amount: number
          reference: string
          seller_id: string
          status: string
          transfer_id: string | null
          updated_at: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          amount: number
          bank_name: string
          created_at?: string | null
          fee: number
          id?: string
          net_amount: number
          reference: string
          seller_id: string
          status?: string
          transfer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          amount?: number
          bank_name?: string
          created_at?: string | null
          fee?: number
          id?: string
          net_amount?: number
          reference?: string
          seller_id?: string
          status?: string
          transfer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_accounts: {
        Row: {
          account_name: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_escrow_account: boolean | null
          monnify_subaccount_code: string
          updated_at: string | null
        }
        Insert: {
          account_name: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_escrow_account?: boolean | null
          monnify_subaccount_code: string
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_escrow_account?: boolean | null
          monnify_subaccount_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          created_at: string
          description: string
          features: Json
          id: string
          is_popular: boolean | null
          monthly_price: number
          name: string
          updated_at: string
          yearly_price: number
        }
        Insert: {
          created_at?: string
          description: string
          features: Json
          id?: string
          is_popular?: boolean | null
          monthly_price: number
          name: string
          updated_at?: string
          yearly_price: number
        }
        Update: {
          created_at?: string
          description?: string
          features?: Json
          id?: string
          is_popular?: boolean | null
          monthly_price?: number
          name?: string
          updated_at?: string
          yearly_price?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          catalog_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          in_stock: boolean
          low_stock_threshold: number | null
          name: string
          price: number
          stock_quantity: number | null
          track_inventory: boolean | null
          updated_at: string
        }
        Insert: {
          catalog_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          in_stock?: boolean
          low_stock_threshold?: number | null
          name: string
          price: number
          stock_quantity?: number | null
          track_inventory?: boolean | null
          updated_at?: string
        }
        Update: {
          catalog_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          in_stock?: boolean
          low_stock_threshold?: number | null
          name?: string
          price?: number
          stock_quantity?: number | null
          track_inventory?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalogs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_address: string | null
          business_description: string | null
          business_name: string
          created_at: string
          email: string | null
          email_support: string | null
          facebook_handle: string | null
          id: string
          instagram_handle: string | null
          kyc_verified: boolean | null
          kyc_verified_at: string | null
          monnify_account_number: string | null
          monnify_bvn: string | null
          monnify_kyc_status: string | null
          monnify_kyc_submitted_at: string | null
          monnify_percentage_charge: number | null
          monnify_subaccount_code: string | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          stock_alert_preferences: Json | null
          subscription_id: string | null
          tiktok_handle: string | null
          twitter_handle: string | null
          updated_at: string
          whatsapp_support: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_address?: string | null
          business_description?: string | null
          business_name: string
          created_at?: string
          email?: string | null
          email_support?: string | null
          facebook_handle?: string | null
          id: string
          instagram_handle?: string | null
          kyc_verified?: boolean | null
          kyc_verified_at?: string | null
          monnify_account_number?: string | null
          monnify_bvn?: string | null
          monnify_kyc_status?: string | null
          monnify_kyc_submitted_at?: string | null
          monnify_percentage_charge?: number | null
          monnify_subaccount_code?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stock_alert_preferences?: Json | null
          subscription_id?: string | null
          tiktok_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string
          whatsapp_support?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_address?: string | null
          business_description?: string | null
          business_name?: string
          created_at?: string
          email?: string | null
          email_support?: string | null
          facebook_handle?: string | null
          id?: string
          instagram_handle?: string | null
          kyc_verified?: boolean | null
          kyc_verified_at?: string | null
          monnify_account_number?: string | null
          monnify_bvn?: string | null
          monnify_kyc_status?: string | null
          monnify_kyc_submitted_at?: string | null
          monnify_percentage_charge?: number | null
          monnify_subaccount_code?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stock_alert_preferences?: Json | null
          subscription_id?: string | null
          tiktok_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string
          whatsapp_support?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          payment_provider: string | null
          payment_provider_subscription_id: string | null
          plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_provider?: string | null
          payment_provider_subscription_id?: string | null
          plan_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          payment_provider?: string | null
          payment_provider_subscription_id?: string | null
          plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      low_stock_products: {
        Row: {
          catalog_id: string | null
          catalog_name: string | null
          created_at: string | null
          description: string | null
          id: string | null
          in_stock: boolean | null
          low_stock_threshold: number | null
          name: string | null
          price: number | null
          stock_quantity: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalogs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_expired_pending_orders: { Args: never; Returns: undefined }
      create_profiles_if_not_exists: { Args: never; Returns: undefined }
      get_app_guest_id: { Args: never; Returns: string }
      get_current_guest_id: { Args: never; Returns: string }
      get_guest_orders: {
        Args: { guest_id_param: string }
        Returns: {
          catalog_id: string
          created_at: string
          customer_address: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_notes: string | null
          escrow_status: string | null
          guest_id: string | null
          id: string
          is_guest_order: boolean | null
          monnify_transaction_reference: string | null
          notes: string | null
          payment_date: string | null
          payment_provider: string | null
          payment_reference: string | null
          payment_status: string | null
          release_date: string | null
          social_media_source: string | null
          status: string
          total_amount: number
          transaction_reference: string | null
          updated_at: string
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      is_admin:
        | { Args: never; Returns: boolean }
        | { Args: { user_id: string }; Returns: boolean }
      refund_funds_to_buyer: {
        Args: { order_id_param: string }
        Returns: undefined
      }
      release_funds_to_seller: {
        Args: { order_id_param: string }
        Returns: undefined
      }
      set_app_guest_id: { Args: { guest_id: string }; Returns: undefined }
      test_guest_id: { Args: never; Returns: string }
    }
    Enums: {
      user_role: "user" | "admin"
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
      user_role: ["user", "admin"],
    },
  },
} as const

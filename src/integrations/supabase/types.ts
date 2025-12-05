export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      catalogs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
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
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_at_purchase: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price_at_purchase: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_at_purchase?: number
          product_id?: string
          quantity?: number
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
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          catalog_id: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          payment_provider: string | null
          payment_reference: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          catalog_id: string
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id?: string
          payment_provider?: string | null
          payment_reference?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          catalog_id?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          payment_provider?: string | null
          payment_reference?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
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
      products: {
        Row: {
          catalog_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          in_stock: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          catalog_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          catalog_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          in_stock?: boolean
          name?: string
          price?: number
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
          business_name: string
          created_at: string
          id: string
          updated_at: string
          paystack_public_key?: string
          paystack_secret_key?: string
          paystack_subaccount_id?: string
          paystack_subaccount_code?: string
          monnify_subaccount_code?: string
          email_support?: string
          whatsapp_support?: string
          twitter_handle?: string
          instagram_handle?: string
          facebook_handle?: string
          role: 'user' | 'admin'
        }
        Insert: {
          business_name: string
          created_at?: string
          id: string
          updated_at?: string
          paystack_public_key?: string
          paystack_secret_key?: string
          paystack_subaccount_id?: string
          paystack_subaccount_code?: string
          monnify_subaccount_code?: string
          email_support?: string
          whatsapp_support?: string
          twitter_handle?: string
          instagram_handle?: string
          facebook_handle?: string
          role?: 'user' | 'admin'
        }
        Update: {
          business_name?: string
          created_at?: string
          id?: string
          updated_at?: string
          paystack_public_key?: string
          paystack_secret_key?: string
          paystack_subaccount_id?: string
          paystack_subaccount_code?: string
          monnify_subaccount_code?: string
          email_support?: string
          whatsapp_support?: string
          twitter_handle?: string
          instagram_handle?: string
          facebook_handle?: string
          role?: 'user' | 'admin'
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          id: string
          name: string
          description: string
          price_monthly: number
          price_yearly: number
          features: {
            product_limit: number
            catalog_limit: number
            analytics: string
            support_level: string
            features: string[]
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price_monthly: number
          price_yearly: number
          features: {
            product_limit: number
            catalog_limit: number
            analytics: string
            support_level: string
            features: string[]
          }
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price_monthly?: number
          price_yearly?: number
          features?: {
            product_limit: number
            catalog_limit: number
            analytics: string
            support_level: string
            features: string[]
          }
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          payment_provider: 'paystack' | 'monnify' | null
          payment_provider_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          payment_provider?: 'monnify' | null
          payment_provider_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          payment_provider?: 'monnify' | null
          payment_provider_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables = Database['public']['Tables']
export type Enums = Database['public']['Enums']

export interface SupabaseTablesConfig {
  subscriptions: Tables['subscriptions']
  pricing_plans: Tables['pricing_plans']
  catalogs: Tables['catalogs']
  products: Tables['products']
  orders: Tables['orders']
  order_items: Tables['order_items']
  profiles: Tables['profiles']
}

export const Constants = {
  public: {
    Enums: {},
  },
} as const

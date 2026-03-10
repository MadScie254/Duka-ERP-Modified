export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          plan: "free" | "pro" | "biashara";
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      shops: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          business_type: string | null;
          location: string | null;
          phone: string | null;
          email: string | null;
          kra_pin: string | null;
          logo_url: string | null;
          currency: string | null;
          timezone: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["shops"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["shops"]["Row"]>;
      };
      products: { Row: Record<string, unknown> };
      sales: { Row: Record<string, unknown> };
      customers: { Row: Record<string, unknown> };
      payments: { Row: Record<string, unknown> };
      expenses: { Row: Record<string, unknown> };
      mpesa_transactions: { Row: Record<string, unknown> };
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Shop = Database["public"]["Tables"]["shops"]["Row"];

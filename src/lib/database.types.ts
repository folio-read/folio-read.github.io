export type ItemStatus = "inbox" | "reading" | "archived";
export type ThemePreference = "system" | "light" | "dark";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          theme: ThemePreference;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          theme?: ThemePreference;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          theme?: ThemePreference;
          created_at?: string;
        };
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          title: string | null;
          excerpt: string | null;
          author: string | null;
          site_name: string | null;
          cover_image_url: string | null;
          favicon_url: string | null;
          reading_time_min: number | null;
          status: ItemStatus;
          created_at: string;
          read_at: string | null;
          search_vector: unknown;
        };
        Insert: {
          id?: string;
          user_id: string;
          url: string;
          title?: string | null;
          excerpt?: string | null;
          author?: string | null;
          site_name?: string | null;
          cover_image_url?: string | null;
          favicon_url?: string | null;
          reading_time_min?: number | null;
          status?: ItemStatus;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          url?: string;
          title?: string | null;
          excerpt?: string | null;
          author?: string | null;
          site_name?: string | null;
          cover_image_url?: string | null;
          favicon_url?: string | null;
          reading_time_min?: number | null;
          status?: ItemStatus;
          created_at?: string;
          read_at?: string | null;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      item_tags: {
        Row: {
          item_id: string;
          tag_id: string;
        };
        Insert: {
          item_id: string;
          tag_id: string;
        };
        Update: {
          item_id?: string;
          tag_id?: string;
        };
        Relationships: [];
      };
      highlights: {
        Row: {
          id: string;
          item_id: string;
          user_id: string;
          text: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          user_id: string;
          text: string;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          user_id?: string;
          text?: string;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.3 (519615d)';
  };
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action_type: string;
          admin_user_id: string;
          created_at: string | null;
          details: Json | null;
          id: string;
          target_user_id: string | null;
        };
        Insert: {
          action_type: string;
          admin_user_id: string;
          created_at?: string | null;
          details?: Json | null;
          id?: string;
          target_user_id?: string | null;
        };
        Update: {
          action_type?: string;
          admin_user_id?: string;
          created_at?: string | null;
          details?: Json | null;
          id?: string;
          target_user_id?: string | null;
        };
        Relationships: [];
      };
      broadcast_messages: {
        Row: {
          club_id: string | null;
          created_at: string;
          delivered_count: number | null;
          id: string;
          message: string;
          message_type: string | null;
          read_count: number | null;
          recipient_count: number | null;
          scheduled_for: string | null;
          sent_at: string | null;
          sent_by: string;
          team_id: string | null;
          title: string;
        };
        Insert: {
          club_id?: string | null;
          created_at?: string;
          delivered_count?: number | null;
          id?: string;
          message: string;
          message_type?: string | null;
          read_count?: number | null;
          recipient_count?: number | null;
          scheduled_for?: string | null;
          sent_at?: string | null;
          sent_by: string;
          team_id?: string | null;
          title: string;
        };
        Update: {
          club_id?: string | null;
          created_at?: string;
          delivered_count?: number | null;
          id?: string;
          message?: string;
          message_type?: string | null;
          read_count?: number | null;
          recipient_count?: number | null;
          scheduled_for?: string | null;
          sent_at?: string | null;
          sent_by?: string;
          team_id?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'broadcast_messages_club_id_fkey';
            columns: ['club_id'];
            isOneToOne: false;
            referencedRelation: 'clubs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'broadcast_messages_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      club_admins: {
        Row: {
          assigned_at: string;
          assigned_by: string | null;
          club_id: string;
          id: string;
          is_primary: boolean | null;
          permissions: string[] | null;
          role: string | null;
          title: string | null;
          user_id: string;
        };
        Insert: {
          assigned_at?: string;
          assigned_by?: string | null;
          club_id: string;
          id?: string;
          is_primary?: boolean | null;
          permissions?: string[] | null;
          role?: string | null;
          title?: string | null;
          user_id: string;
        };
        Update: {
          assigned_at?: string;
          assigned_by?: string | null;
          club_id?: string;
          id?: string;
          is_primary?: boolean | null;
          permissions?: string[] | null;
          role?: string | null;
          title?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'club_admins_club_id_fkey';
            columns: ['club_id'];
            isOneToOne: false;
            referencedRelation: 'clubs';
            referencedColumns: ['id'];
          },
        ];
      };
      club_members: {
        Row: {
          added_by: string | null;
          club_id: string;
          joined_at: string | null;
          role: string | null;
          user_id: string;
        };
        Insert: {
          added_by?: string | null;
          club_id: string;
          joined_at?: string | null;
          role?: string | null;
          user_id: string;
        };
        Update: {
          added_by?: string | null;
          club_id?: string;
          joined_at?: string | null;
          role?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'club_members_club_id_fkey';
            columns: ['club_id'];
            isOneToOne: false;
            referencedRelation: 'clubs';
            referencedColumns: ['id'];
          },
        ];
      };
      club_search_index: {
        Row: {
          club_id: string;
          content_vector: unknown | null;
          id: string;
          is_active: boolean | null;
          last_activity: string | null;
          location_vector: unknown | null;
          member_count: number | null;
          search_text: string;
          sport_types: string[];
          team_count: number | null;
          updated_at: string;
        };
        Insert: {
          club_id: string;
          content_vector?: unknown | null;
          id?: string;
          is_active?: boolean | null;
          last_activity?: string | null;
          location_vector?: unknown | null;
          member_count?: number | null;
          search_text: string;
          sport_types: string[];
          team_count?: number | null;
          updated_at?: string;
        };
        Update: {
          club_id?: string;
          content_vector?: unknown | null;
          id?: string;
          is_active?: boolean | null;
          last_activity?: string | null;
          location_vector?: unknown | null;
          member_count?: number | null;
          search_text?: string;
          sport_types?: string[];
          team_count?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'club_search_index_club_id_fkey';
            columns: ['club_id'];
            isOneToOne: false;
            referencedRelation: 'clubs';
            referencedColumns: ['id'];
          },
        ];
      };
      clubs: {
        Row: {
          about_description: string | null;
          background_image_url: string | null;
          club_badge_url: string | null;
          contact_email: string;
          contact_phone: string | null;
          created_at: string;
          created_by: string | null;
          facebook_url: string | null;
          founded_year: number | null;
          id: string;
          instagram_url: string | null;
          is_active: boolean | null;
          location: Json | null;
          location_city: string;
          location_country: string;
          location_latitude: number | null;
          location_longitude: number | null;
          location_postcode: string | null;
          name: string;
          slug: string;
          sport_type: string;
          sports: string[] | null;
          twitter_url: string | null;
          updated_at: string;
          website_url: string | null;
        };
        Insert: {
          about_description?: string | null;
          background_image_url?: string | null;
          club_badge_url?: string | null;
          contact_email: string;
          contact_phone?: string | null;
          created_at?: string;
          created_by?: string | null;
          facebook_url?: string | null;
          founded_year?: number | null;
          id?: string;
          instagram_url?: string | null;
          is_active?: boolean | null;
          location?: Json | null;
          location_city: string;
          location_country?: string;
          location_latitude?: number | null;
          location_longitude?: number | null;
          location_postcode?: string | null;
          name: string;
          slug: string;
          sport_type: string;
          sports?: string[] | null;
          twitter_url?: string | null;
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          about_description?: string | null;
          background_image_url?: string | null;
          club_badge_url?: string | null;
          contact_email?: string;
          contact_phone?: string | null;
          created_at?: string;
          created_by?: string | null;
          facebook_url?: string | null;
          founded_year?: number | null;
          id?: string;
          instagram_url?: string | null;
          is_active?: boolean | null;
          location?: Json | null;
          location_city?: string;
          location_country?: string;
          location_latitude?: number | null;
          location_longitude?: number | null;
          location_postcode?: string | null;
          name?: string;
          slug?: string;
          sport_type?: string;
          sports?: string[] | null;
          twitter_url?: string | null;
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [];
      };
      device_tokens: {
        Row: {
          app_version: string | null;
          created_at: string | null;
          device_id: string;
          id: string;
          is_active: boolean | null;
          last_used: string | null;
          platform: string;
          token: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          app_version?: string | null;
          created_at?: string | null;
          device_id: string;
          id?: string;
          is_active?: boolean | null;
          last_used?: string | null;
          platform: string;
          token: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          app_version?: string | null;
          created_at?: string | null;
          device_id?: string;
          id?: string;
          is_active?: boolean | null;
          last_used?: string | null;
          platform?: string;
          token?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      event_availability: {
        Row: {
          availability_status: string;
          event_id: string;
          id: string;
          reason: string | null;
          responded_at: string;
          user_id: string;
        };
        Insert: {
          availability_status: string;
          event_id: string;
          id?: string;
          reason?: string | null;
          responded_at?: string;
          user_id: string;
        };
        Update: {
          availability_status?: string;
          event_id?: string;
          id?: string;
          reason?: string | null;
          responded_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_availability_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      event_invitations: {
        Row: {
          event_id: string;
          id: string;
          invitation_status: string | null;
          invited_at: string;
          invited_by: string;
          user_id: string;
        };
        Insert: {
          event_id: string;
          id?: string;
          invitation_status?: string | null;
          invited_at?: string;
          invited_by: string;
          user_id: string;
        };
        Update: {
          event_id?: string;
          id?: string;
          invitation_status?: string | null;
          invited_at?: string;
          invited_by?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_invitations_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      event_locations: {
        Row: {
          address: string;
          created_at: string;
          facilities: string[] | null;
          id: string;
          is_home_venue: boolean | null;
          latitude: number | null;
          location_type: string | null;
          longitude: number | null;
          name: string;
          notes: string | null;
          team_id: string;
          updated_at: string;
        };
        Insert: {
          address: string;
          created_at?: string;
          facilities?: string[] | null;
          id?: string;
          is_home_venue?: boolean | null;
          latitude?: number | null;
          location_type?: string | null;
          longitude?: number | null;
          name: string;
          notes?: string | null;
          team_id: string;
          updated_at?: string;
        };
        Update: {
          address?: string;
          created_at?: string;
          facilities?: string[] | null;
          id?: string;
          is_home_venue?: boolean | null;
          latitude?: number | null;
          location_type?: string | null;
          longitude?: number | null;
          name?: string;
          notes?: string | null;
          team_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_locations_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      event_participants: {
        Row: {
          attendance_status: string | null;
          created_at: string | null;
          event_id: string;
          id: string;
          invited_at: string | null;
          invited_by: string | null;
          notes: string | null;
          role: string | null;
          rsvp_at: string | null;
          rsvp_response: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          attendance_status?: string | null;
          created_at?: string | null;
          event_id: string;
          id?: string;
          invited_at?: string | null;
          invited_by?: string | null;
          notes?: string | null;
          role?: string | null;
          rsvp_at?: string | null;
          rsvp_response?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          attendance_status?: string | null;
          created_at?: string | null;
          event_id?: string;
          id?: string;
          invited_at?: string | null;
          invited_by?: string | null;
          notes?: string | null;
          role?: string | null;
          rsvp_at?: string | null;
          rsvp_response?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_participants_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      event_squads: {
        Row: {
          event_id: string;
          id: string;
          position: string | null;
          selected_at: string;
          selected_by: string;
          selection_notes: string | null;
          squad_role: string | null;
          user_id: string;
        };
        Insert: {
          event_id: string;
          id?: string;
          position?: string | null;
          selected_at?: string;
          selected_by: string;
          selection_notes?: string | null;
          squad_role?: string | null;
          user_id: string;
        };
        Update: {
          event_id?: string;
          id?: string;
          position?: string | null;
          selected_at?: string;
          selected_by?: string;
          selection_notes?: string | null;
          squad_role?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_squads_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      events: {
        Row: {
          cancellation_reason: string | null;
          cancelled_at: string | null;
          cancelled_by: string | null;
          cancelled_reason: string | null;
          created_at: string;
          created_by: string;
          description: string | null;
          end_time: string | null;
          event_date: string;
          event_status: string | null;
          event_type: string;
          feedback_requested: boolean | null;
          id: string;
          is_home_event: boolean | null;
          location: string | null;
          location_address: string | null;
          location_latitude: number | null;
          location_longitude: number | null;
          location_name: string | null;
          max_participants: number | null;
          notes: string | null;
          opponent: string | null;
          start_time: string;
          status: string | null;
          team_id: string;
          title: string;
          type: string | null;
          updated_at: string;
          weather_consideration: boolean | null;
        };
        Insert: {
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          cancelled_reason?: string | null;
          created_at?: string;
          created_by: string;
          description?: string | null;
          end_time?: string | null;
          event_date: string;
          event_status?: string | null;
          event_type: string;
          feedback_requested?: boolean | null;
          id?: string;
          is_home_event?: boolean | null;
          location?: string | null;
          location_address?: string | null;
          location_latitude?: number | null;
          location_longitude?: number | null;
          location_name?: string | null;
          max_participants?: number | null;
          notes?: string | null;
          opponent?: string | null;
          start_time: string;
          status?: string | null;
          team_id: string;
          title: string;
          type?: string | null;
          updated_at?: string;
          weather_consideration?: boolean | null;
        };
        Update: {
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          cancelled_reason?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          end_time?: string | null;
          event_date?: string;
          event_status?: string | null;
          event_type?: string;
          feedback_requested?: boolean | null;
          id?: string;
          is_home_event?: boolean | null;
          location?: string | null;
          location_address?: string | null;
          location_latitude?: number | null;
          location_longitude?: number | null;
          location_name?: string | null;
          max_participants?: number | null;
          notes?: string | null;
          opponent?: string | null;
          start_time?: string;
          status?: string | null;
          team_id?: string;
          title?: string;
          type?: string | null;
          updated_at?: string;
          weather_consideration?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'events_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      interest_expressions: {
        Row: {
          expressed_at: string;
          id: string;
          interest_status: string | null;
          message: string | null;
          responded_at: string | null;
          responded_by: string | null;
          response_message: string | null;
          team_id: string;
          user_id: string;
        };
        Insert: {
          expressed_at?: string;
          id?: string;
          interest_status?: string | null;
          message?: string | null;
          responded_at?: string | null;
          responded_by?: string | null;
          response_message?: string | null;
          team_id: string;
          user_id: string;
        };
        Update: {
          expressed_at?: string;
          id?: string;
          interest_status?: string | null;
          message?: string | null;
          responded_at?: string | null;
          responded_by?: string | null;
          response_message?: string | null;
          team_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'interest_expressions_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      notification_preferences: {
        Row: {
          created_at: string;
          email_enabled: boolean | null;
          id: string;
          in_app_enabled: boolean | null;
          notification_type: string;
          push_enabled: boolean | null;
          quiet_hours_enabled: boolean | null;
          quiet_hours_end: string | null;
          quiet_hours_start: string | null;
          team_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          email_enabled?: boolean | null;
          id?: string;
          in_app_enabled?: boolean | null;
          notification_type: string;
          push_enabled?: boolean | null;
          quiet_hours_enabled?: boolean | null;
          quiet_hours_end?: string | null;
          quiet_hours_start?: string | null;
          team_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          email_enabled?: boolean | null;
          id?: string;
          in_app_enabled?: boolean | null;
          notification_type?: string;
          push_enabled?: boolean | null;
          quiet_hours_enabled?: boolean | null;
          quiet_hours_end?: string | null;
          quiet_hours_start?: string | null;
          team_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notification_preferences_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      notification_queue: {
        Row: {
          attempts: number | null;
          created_at: string | null;
          error: string | null;
          id: string;
          last_attempt: string | null;
          priority: number | null;
          scheduled_for: string;
          status: string | null;
          template_id: string;
          user_id: string | null;
          variables: Json | null;
        };
        Insert: {
          attempts?: number | null;
          created_at?: string | null;
          error?: string | null;
          id?: string;
          last_attempt?: string | null;
          priority?: number | null;
          scheduled_for: string;
          status?: string | null;
          template_id: string;
          user_id?: string | null;
          variables?: Json | null;
        };
        Update: {
          attempts?: number | null;
          created_at?: string | null;
          error?: string | null;
          id?: string;
          last_attempt?: string | null;
          priority?: number | null;
          scheduled_for?: string;
          status?: string | null;
          template_id?: string;
          user_id?: string | null;
          variables?: Json | null;
        };
        Relationships: [];
      };
      notification_templates: {
        Row: {
          actions: Json | null;
          body: string;
          category: string;
          created_at: string | null;
          id: string;
          is_active: boolean | null;
          priority: string | null;
          title: string;
          trigger: string;
          type: string | null;
          updated_at: string | null;
          variables: string[] | null;
        };
        Insert: {
          actions?: Json | null;
          body: string;
          category: string;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          priority?: string | null;
          title: string;
          trigger: string;
          type?: string | null;
          updated_at?: string | null;
          variables?: string[] | null;
        };
        Update: {
          actions?: Json | null;
          body?: string;
          category?: string;
          created_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          priority?: string | null;
          title?: string;
          trigger?: string;
          type?: string | null;
          updated_at?: string | null;
          variables?: string[] | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string;
          data: Json | null;
          delivery_attempts: number | null;
          delivery_method: string | null;
          delivery_status: string | null;
          expires_at: string | null;
          id: string;
          is_read: boolean | null;
          last_delivery_attempt: string | null;
          message: string;
          notification_type: string;
          priority: string | null;
          read_at: string | null;
          related_entity_id: string | null;
          related_entity_type: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          data?: Json | null;
          delivery_attempts?: number | null;
          delivery_method?: string | null;
          delivery_status?: string | null;
          expires_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          last_delivery_attempt?: string | null;
          message: string;
          notification_type: string;
          priority?: string | null;
          read_at?: string | null;
          related_entity_id?: string | null;
          related_entity_type?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          data?: Json | null;
          delivery_attempts?: number | null;
          delivery_method?: string | null;
          delivery_status?: string | null;
          expires_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          last_delivery_attempt?: string | null;
          message?: string;
          notification_type?: string;
          priority?: string | null;
          read_at?: string | null;
          related_entity_id?: string | null;
          related_entity_type?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      payment_reminders: {
        Row: {
          custom_message: string | null;
          delivery_status: string | null;
          id: string;
          payment_request_id: string;
          reminder_method: string;
          reminder_type: string;
          sent_at: string;
          sent_by: string | null;
          user_id: string;
        };
        Insert: {
          custom_message?: string | null;
          delivery_status?: string | null;
          id?: string;
          payment_request_id: string;
          reminder_method: string;
          reminder_type: string;
          sent_at?: string;
          sent_by?: string | null;
          user_id: string;
        };
        Update: {
          custom_message?: string | null;
          delivery_status?: string | null;
          id?: string;
          payment_request_id?: string;
          reminder_method?: string;
          reminder_type?: string;
          sent_at?: string;
          sent_by?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_reminders_payment_request_id_fkey';
            columns: ['payment_request_id'];
            isOneToOne: false;
            referencedRelation: 'payment_requests';
            referencedColumns: ['id'];
          },
        ];
      };
      payment_request_members: {
        Row: {
          amount_pence: number;
          created_at: string;
          currency: string | null;
          failure_reason: string | null;
          id: string;
          paid_at: string | null;
          payment_method: string | null;
          payment_request_id: string;
          payment_status: string | null;
          stripe_payment_intent_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount_pence: number;
          created_at?: string;
          currency?: string | null;
          failure_reason?: string | null;
          id?: string;
          paid_at?: string | null;
          payment_method?: string | null;
          payment_request_id: string;
          payment_status?: string | null;
          stripe_payment_intent_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount_pence?: number;
          created_at?: string;
          currency?: string | null;
          failure_reason?: string | null;
          id?: string;
          paid_at?: string | null;
          payment_method?: string | null;
          payment_request_id?: string;
          payment_status?: string | null;
          stripe_payment_intent_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_request_members_payment_request_id_fkey';
            columns: ['payment_request_id'];
            isOneToOne: false;
            referencedRelation: 'payment_requests';
            referencedColumns: ['id'];
          },
        ];
      };
      payment_request_users: {
        Row: {
          amount: number;
          amount_pence: number;
          created_at: string | null;
          id: string;
          notes: string | null;
          paid_at: string | null;
          payment_method: string | null;
          payment_request_id: string;
          status: string | null;
          transaction_id: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          amount_pence: number;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          paid_at?: string | null;
          payment_method?: string | null;
          payment_request_id: string;
          status?: string | null;
          transaction_id?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          amount_pence?: number;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          paid_at?: string | null;
          payment_method?: string | null;
          payment_request_id?: string;
          status?: string | null;
          transaction_id?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_request_users_payment_request_id_fkey';
            columns: ['payment_request_id'];
            isOneToOne: false;
            referencedRelation: 'payment_requests';
            referencedColumns: ['id'];
          },
        ];
      };
      payment_requests: {
        Row: {
          amount_pence: number;
          created_at: string;
          created_by: string;
          currency: string | null;
          description: string | null;
          due_date: string;
          id: string;
          paid_members: number | null;
          payment_type: string | null;
          request_status: string | null;
          team_id: string;
          title: string;
          total_collected_pence: number | null;
          total_members: number | null;
          updated_at: string;
        };
        Insert: {
          amount_pence: number;
          created_at?: string;
          created_by: string;
          currency?: string | null;
          description?: string | null;
          due_date: string;
          id?: string;
          paid_members?: number | null;
          payment_type?: string | null;
          request_status?: string | null;
          team_id: string;
          title: string;
          total_collected_pence?: number | null;
          total_members?: number | null;
          updated_at?: string;
        };
        Update: {
          amount_pence?: number;
          created_at?: string;
          created_by?: string;
          currency?: string | null;
          description?: string | null;
          due_date?: string;
          id?: string;
          paid_members?: number | null;
          payment_type?: string | null;
          request_status?: string | null;
          team_id?: string;
          title?: string;
          total_collected_pence?: number | null;
          total_members?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_requests_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      payment_transactions: {
        Row: {
          amount_pence: number;
          created_at: string;
          currency: string;
          failure_code: string | null;
          failure_message: string | null;
          id: string;
          net_amount_pence: number;
          payment_method: string | null;
          payment_method_details: Json | null;
          payment_request_member_id: string;
          platform_fee_pence: number;
          stripe_charge_id: string | null;
          stripe_payment_intent_id: string;
          stripe_status: string | null;
          transaction_status: string;
          updated_at: string;
        };
        Insert: {
          amount_pence: number;
          created_at?: string;
          currency: string;
          failure_code?: string | null;
          failure_message?: string | null;
          id?: string;
          net_amount_pence: number;
          payment_method?: string | null;
          payment_method_details?: Json | null;
          payment_request_member_id: string;
          platform_fee_pence: number;
          stripe_charge_id?: string | null;
          stripe_payment_intent_id: string;
          stripe_status?: string | null;
          transaction_status: string;
          updated_at?: string;
        };
        Update: {
          amount_pence?: number;
          created_at?: string;
          currency?: string;
          failure_code?: string | null;
          failure_message?: string | null;
          id?: string;
          net_amount_pence?: number;
          payment_method?: string | null;
          payment_method_details?: Json | null;
          payment_request_member_id?: string;
          platform_fee_pence?: number;
          stripe_charge_id?: string | null;
          stripe_payment_intent_id?: string;
          stripe_status?: string | null;
          transaction_status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_transactions_payment_request_member_id_fkey';
            columns: ['payment_request_member_id'];
            isOneToOne: false;
            referencedRelation: 'payment_request_members';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          amount_pence: number;
          created_at: string | null;
          error_message: string | null;
          id: string;
          paid_at: string | null;
          payment_method: string | null;
          payment_request_id: string | null;
          status: string | null;
          stripe_charge_id: string | null;
          stripe_payment_intent_id: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          amount_pence: number;
          created_at?: string | null;
          error_message?: string | null;
          id?: string;
          paid_at?: string | null;
          payment_method?: string | null;
          payment_request_id?: string | null;
          status?: string | null;
          stripe_charge_id?: string | null;
          stripe_payment_intent_id?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          amount_pence?: number;
          created_at?: string | null;
          error_message?: string | null;
          id?: string;
          paid_at?: string | null;
          payment_method?: string | null;
          payment_request_id?: string | null;
          status?: string | null;
          stripe_charge_id?: string | null;
          stripe_payment_intent_id?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_payment_request_id_fkey';
            columns: ['payment_request_id'];
            isOneToOne: false;
            referencedRelation: 'payment_requests';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          background_image_uri: string | null;
          created_at: string;
          date_of_birth: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          profile_photo_uri: string | null;
          team_sort: string | null;
          updated_at: string;
        };
        Insert: {
          background_image_uri?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          profile_photo_uri?: string | null;
          team_sort?: string | null;
          updated_at?: string;
        };
        Update: {
          background_image_uri?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          profile_photo_uri?: string | null;
          team_sort?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      push_tokens: {
        Row: {
          app_version: string | null;
          created_at: string;
          device_id: string | null;
          device_name: string | null;
          id: string;
          is_active: boolean | null;
          last_used_at: string;
          platform: string;
          token: string;
          user_id: string;
        };
        Insert: {
          app_version?: string | null;
          created_at?: string;
          device_id?: string | null;
          device_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_used_at?: string;
          platform: string;
          token: string;
          user_id: string;
        };
        Update: {
          app_version?: string | null;
          created_at?: string;
          device_id?: string | null;
          device_name?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_used_at?: string;
          platform?: string;
          token?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      stripe_accounts: {
        Row: {
          account_email: string | null;
          account_status: string | null;
          business_type: string | null;
          charges_enabled: boolean | null;
          country: string | null;
          created_at: string;
          currency: string | null;
          id: string;
          payouts_enabled: boolean | null;
          stripe_account_id: string;
          team_id: string;
          updated_at: string;
        };
        Insert: {
          account_email?: string | null;
          account_status?: string | null;
          business_type?: string | null;
          charges_enabled?: boolean | null;
          country?: string | null;
          created_at?: string;
          currency?: string | null;
          id?: string;
          payouts_enabled?: boolean | null;
          stripe_account_id: string;
          team_id: string;
          updated_at?: string;
        };
        Update: {
          account_email?: string | null;
          account_status?: string | null;
          business_type?: string | null;
          charges_enabled?: boolean | null;
          country?: string | null;
          created_at?: string;
          currency?: string | null;
          id?: string;
          payouts_enabled?: boolean | null;
          stripe_account_id?: string;
          team_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'stripe_accounts_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: true;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      team_admins: {
        Row: {
          assigned_at: string;
          assigned_by: string | null;
          id: string;
          is_primary: boolean | null;
          permissions: string[] | null;
          role: string | null;
          team_id: string;
          title: string | null;
          user_id: string;
        };
        Insert: {
          assigned_at?: string;
          assigned_by?: string | null;
          id?: string;
          is_primary?: boolean | null;
          permissions?: string[] | null;
          role?: string | null;
          team_id: string;
          title?: string | null;
          user_id: string;
        };
        Update: {
          assigned_at?: string;
          assigned_by?: string | null;
          id?: string;
          is_primary?: boolean | null;
          permissions?: string[] | null;
          role?: string | null;
          team_id?: string;
          title?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'team_admins_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      team_invitations: {
        Row: {
          accepted_at: string | null;
          club_id: string | null;
          created_at: string | null;
          email: string | null;
          expires_at: string | null;
          id: string;
          invited_by: string | null;
          invited_user_id: string | null;
          message: string | null;
          phone: string | null;
          role: string | null;
          status: string | null;
          team_id: string | null;
          token: string | null;
        };
        Insert: {
          accepted_at?: string | null;
          club_id?: string | null;
          created_at?: string | null;
          email?: string | null;
          expires_at?: string | null;
          id?: string;
          invited_by?: string | null;
          invited_user_id?: string | null;
          message?: string | null;
          phone?: string | null;
          role?: string | null;
          status?: string | null;
          team_id?: string | null;
          token?: string | null;
        };
        Update: {
          accepted_at?: string | null;
          club_id?: string | null;
          created_at?: string | null;
          email?: string | null;
          expires_at?: string | null;
          id?: string;
          invited_by?: string | null;
          invited_user_id?: string | null;
          message?: string | null;
          phone?: string | null;
          role?: string | null;
          status?: string | null;
          team_id?: string | null;
          token?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'team_invitations_club_id_fkey';
            columns: ['club_id'];
            isOneToOne: false;
            referencedRelation: 'clubs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'team_invitations_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      team_members: {
        Row: {
          added_by: string | null;
          id: string;
          jersey_number: number | null;
          joined_at: string;
          left_at: string | null;
          member_status: string | null;
          position: string | null;
          team_id: string;
          user_id: string;
        };
        Insert: {
          added_by?: string | null;
          id?: string;
          jersey_number?: number | null;
          joined_at?: string;
          left_at?: string | null;
          member_status?: string | null;
          position?: string | null;
          team_id: string;
          user_id: string;
        };
        Update: {
          added_by?: string | null;
          id?: string;
          jersey_number?: number | null;
          joined_at?: string;
          left_at?: string | null;
          member_status?: string | null;
          position?: string | null;
          team_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'team_members_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      teams: {
        Row: {
          age_group: string | null;
          club_id: string;
          created_at: string;
          founded_year: number | null;
          home_ground: string | null;
          home_ground_address: string | null;
          home_ground_latitude: number | null;
          home_ground_longitude: number | null;
          id: string;
          is_active: boolean | null;
          league_name: string | null;
          match_day: string | null;
          match_time: string | null;
          motto: string | null;
          name: string;
          sport: string;
          team_level: string | null;
          team_photo_url: string | null;
          team_sort: string | null;
          team_type: string;
          training_day_1: string | null;
          training_day_2: string | null;
          training_time_1: string | null;
          training_time_2: string | null;
          updated_at: string;
        };
        Insert: {
          age_group?: string | null;
          club_id: string;
          created_at?: string;
          founded_year?: number | null;
          home_ground?: string | null;
          home_ground_address?: string | null;
          home_ground_latitude?: number | null;
          home_ground_longitude?: number | null;
          id?: string;
          is_active?: boolean | null;
          league_name?: string | null;
          match_day?: string | null;
          match_time?: string | null;
          motto?: string | null;
          name: string;
          sport: string;
          team_level?: string | null;
          team_photo_url?: string | null;
          team_sort?: string | null;
          team_type: string;
          training_day_1?: string | null;
          training_day_2?: string | null;
          training_time_1?: string | null;
          training_time_2?: string | null;
          updated_at?: string;
        };
        Update: {
          age_group?: string | null;
          club_id?: string;
          created_at?: string;
          founded_year?: number | null;
          home_ground?: string | null;
          home_ground_address?: string | null;
          home_ground_latitude?: number | null;
          home_ground_longitude?: number | null;
          id?: string;
          is_active?: boolean | null;
          league_name?: string | null;
          match_day?: string | null;
          match_time?: string | null;
          motto?: string | null;
          name?: string;
          sport?: string;
          team_level?: string | null;
          team_photo_url?: string | null;
          team_sort?: string | null;
          team_type?: string;
          training_day_1?: string | null;
          training_day_2?: string | null;
          training_time_1?: string | null;
          training_time_2?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'teams_club_id_fkey';
            columns: ['club_id'];
            isOneToOne: false;
            referencedRelation: 'clubs';
            referencedColumns: ['id'];
          },
        ];
      };
      test: {
        Row: {
          created_at: string;
          id: number;
          name: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      end_impersonation: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      generate_invitation_token: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      is_super_admin: {
        Args: Record<PropertyKey, never> | { user_id: string };
        Returns: boolean;
      };
      search_users: {
        Args: { search_term: string };
        Returns: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          created_at: string;
        }[];
      };
      search_users_for_team: {
        Args: { p_search_term: string; p_team_id: string; p_limit?: number };
        Returns: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          avatar_url: string;
          is_member: boolean;
        }[];
      };
      start_impersonation: {
        Args: { target_user_id: string };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

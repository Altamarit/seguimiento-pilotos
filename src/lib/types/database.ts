export type AppRole = "lector" | "editor" | "admin";
export type PilotStatus = "planificado" | "en_marcha" | "finalizado" | "cancelado";
export type ImpactEventType = "formacion" | "productividad" | "otro";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  user_id: string;
  role: AppRole;
  assigned_by: string | null;
  assigned_at: string;
  created_at: string;
  updated_at: string;
}

export interface Pilot {
  id: string;
  name: string;
  objective: string | null;
  status: PilotStatus;
  start_date: string | null;
  end_date: string | null;
  trained_people_count: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImpactEvent {
  id: string;
  pilot_id: string;
  event_type: ImpactEventType;
  event_date: string;
  description: string;
  trained_people_event: number | null;
  productivity_improvement_pct: number | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PilotCurrentProductivity {
  pilot_id: string;
  productivity_improvement_pct: number | null;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: UserRole;
        Insert: {
          user_id: string;
          role?: AppRole;
          assigned_by?: string | null;
          assigned_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          role?: AppRole;
          assigned_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      pilots: {
        Row: Pilot;
        Insert: {
          id?: string;
          name: string;
          objective?: string | null;
          status?: PilotStatus;
          start_date?: string | null;
          end_date?: string | null;
          trained_people_count?: number;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          objective?: string | null;
          status?: PilotStatus;
          start_date?: string | null;
          end_date?: string | null;
          trained_people_count?: number;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      impact_events: {
        Row: ImpactEvent;
        Insert: {
          id?: string;
          pilot_id: string;
          event_type: ImpactEventType;
          event_date: string;
          description: string;
          trained_people_event?: number | null;
          productivity_improvement_pct?: number | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          pilot_id?: string;
          event_type?: ImpactEventType;
          event_date?: string;
          description?: string;
          trained_people_event?: number | null;
          productivity_improvement_pct?: number | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "impact_events_pilot_id_fkey";
            columns: ["pilot_id"];
            isOneToOne: false;
            referencedRelation: "pilots";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      pilot_current_productivity: {
        Row: PilotCurrentProductivity;
        Relationships: [];
      };
    };
    Functions: {
      get_my_role: {
        Args: Record<PropertyKey, never>;
        Returns: AppRole;
      };
    };
    Enums: {
      app_role: AppRole;
      pilot_status: PilotStatus;
      impact_event_type: ImpactEventType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type ProfileWithRole = Profile & { role: AppRole };

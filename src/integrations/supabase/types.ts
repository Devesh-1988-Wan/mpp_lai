export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          changes: Json | null
          created_at: string | null
          id: string
          project_id: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          project_id: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          project_id?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_with_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          amount: number
          budget_id: number
          category: string | null
          created_at: string | null
          description: string
          id: number
          transaction_date: string | null
          type: string
        }
        Insert: {
          amount: number
          budget_id: number
          category?: string | null
          created_at?: string | null
          description: string
          id?: never
          transaction_date?: string | null
          type: string
        }
        Update: {
          amount?: number
          budget_id?: number
          category?: string | null
          created_at?: string | null
          description?: string
          id?: never
          transaction_date?: string | null
          type?: string
<<<<<<< HEAD
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
=======
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          created_at: string | null
          id: number
          project_id: string
          total_budget: number
        }
        Insert: {
          created_at?: string | null
          id?: never
          project_id: string
          total_budget: number
        }
        Update: {
          created_at?: string | null
          id?: never
          project_id?: string
          total_budget?: number
        }
        Relationships: [
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_fields: {
        Row: {
          created_at: string | null
          default_value: string | null
          field_type: string
          id: string
          name: string
          options: Json | null
          project_id: string
          required: boolean | null
        }
        Insert: {
          created_at?: string | null
          default_value?: string | null
          field_type: string
          id?: string
          name: string
          options?: Json | null
          project_id: string
          required?: boolean | null
        }
        Update: {
          created_at?: string | null
          default_value?: string | null
          field_type?: string
          id?: string
          name?: string
          options?: Json | null
          project_id?: string
          required?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_fields_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_fields_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          budget_id: string
          created_at: string | null
          description: string | null
          id: string
          incurred_on: string
          project_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          budget_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          incurred_on: string
          project_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          budget_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          incurred_on?: string
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_with_counts"
>>>>>>> 586fdab92bfd5c7a780434fb6882d9c4c8249a48
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          created_at: string | null
          id: number
          project_id: string
          total_budget: number
        }
        Insert: {
          created_at?: string | null
          id?: never
          project_id: string
          total_budget: number
        }
        Update: {
          created_at?: string | null
          id?: never
          project_id?: string
          total_budget?: number
        }
        Relationships: [
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      // Other tables from your schema would go here...
      resource_allocations: {
        Row: {
          allocated_hours: number | null
          created_at: string | null
<<<<<<< HEAD
          id: number
          resource_id: number
=======
          display_name: string | null
          email: string
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_permissions: {
        Row: {
          created_at: string | null
          granted_by: string | null
          id: string
          permission_level: string | null
          project_id: string | null
          updated_at: string | null
          user_email: string
        }
        Insert: {
          created_at?: string | null
          granted_by?: string | null
          id?: string
          permission_level?: string | null
          project_id?: string | null
          updated_at?: string | null
          user_email: string
        }
        Update: {
          created_at?: string | null
          granted_by?: string | null
          id?: string
          permission_level?: string | null
          project_id?: string | null
          updated_at?: string | null
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_permissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_permissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_by: string
          created_date: string | null
          description: string | null
          id: string
          last_modified: string | null
          name: string
          status: string | null
          team_members: Json | null
        }
        Insert: {
          created_by: string
          created_date?: string | null
          description?: string | null
          id?: string
          last_modified?: string | null
          name: string
          status?: string | null
          team_members?: Json | null
        }
        Update: {
          created_by?: string
          created_date?: string | null
          description?: string | null
          id?: string
          last_modified?: string | null
          name?: string
          status?: string | null
          team_members?: Json | null
        }
        Relationships: []
      }
      resource_allocations: {
        Row: {
          allocated_hours: number | null
          created_at: string | null
          id: number
          resource_id: number
          task_id: string
        }
        Insert: {
          allocated_hours?: number | null
          created_at?: string | null
          id?: never
          resource_id: number
          task_id: string
        }
        Update: {
          allocated_hours?: number | null
          created_at?: string | null
          id?: never
          resource_id?: number
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_allocations_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_allocations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          availability: Json | null
          cost_per_hour: number | null
          created_at: string | null
          id: number
          name: string
          project_id: string
          type: string | null
        }
        Insert: {
          availability?: Json | null
          cost_per_hour?: number | null
          created_at?: string | null
          id?: never
          name: string
          project_id: string
          type?: string | null
        }
        Update: {
          availability?: Json | null
          cost_per_hour?: number | null
          created_at?: string | null
          id?: never
          name?: string
          project_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_with_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      task_resources: {
        Row: {
          assigned_at: string | null
          id: string
          resource_id: string
>>>>>>> 586fdab92bfd5c7a780434fb6882d9c4c8249a48
          task_id: string
        }
        Insert: {
          allocated_hours?: number | null
          created_at?: string | null
          id?: never
          resource_id: number
          task_id: string
        }
        Update: {
          allocated_hours?: number | null
          created_at?: string | null
          id?: never
          resource_id?: number
          task_id?: string
        }
        Relationships: [
          {
<<<<<<< HEAD
            foreignKeyName: "resource_allocations_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_allocations_task_id_fkey"
=======
            foreignKeyName: "task_resources_task_id_fkey"
>>>>>>> 586fdab92bfd5c7a780434fb6882d9c4c8249a48
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          availability: Json | null
          cost_per_hour: number | null
          created_at: string | null
          id: number
          name: string
          project_id: string
          type: string | null
        }
        Insert: {
          availability?: Json | null
          cost_per_hour?: number | null
          created_at?: string | null
          id?: never
          name: string
          project_id: string
          type?: string | null
        }
        Update: {
          availability?: Json | null
          cost_per_hour?: number | null
          created_at?: string | null
          id?: never
          name?: string
          project_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_with_counts"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          assignee: string | null
          created_at: string | null
          dependencies: Json | null
          description: string | null
          developer: string | null
          docs_progress:
            | Database["public"]["Enums"]["docs_progress_status"]
            | null
          end_date: string
          estimated_days: number | null
          estimated_hours: number | null
          id: string
          name: string
          priority: Database["public"]["Enums"]["task_priority"] | null
          project_id: string
          start_date: string
          status: string | null
          task_type: string | null
          updated_at: string | null
          work_item_link: string | null
        }
        Insert: {
          assignee?: string | null
          created_at?: string | null
          dependencies?: Json | null
          description?: string | null
          developer?: string | null
          docs_progress?:
            | Database["public"]["Enums"]["docs_progress_status"]
            | null
          end_date: string
          estimated_days?: number | null
          estimated_hours?: number | null
          id?: string
          name: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          project_id: string
          start_date: string
          status?: string | null
          task_type?: string | null
          updated_at?: string | null
          work_item_link?: string | null
        }
        Update: {
          assignee?: string | null
          created_at?: string | null
          dependencies?: Json | null
          description?: string | null
          developer?: string | null
          docs_progress?:
            | Database["public"]["Enums"]["docs_progress_status"]
            | null
          end_date?: string
          estimated_days?: number | null
          estimated_hours?: number | null
          id?: string
          name?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          project_id?: string
          start_date?: string
          status?: string | null
          task_type?: string | null
          updated_at?: string | null
          work_item_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_with_counts"
            referencedColumns: ["id"]
          }
        ]
      }
      // Other tables from your schema would go here...
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      // Functions from your schema would go here...
      check_user_is_member: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      check_user_is_member: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      check_user_project_permission: {
        Args: { p_project_id: string }
        Returns: boolean
      }
      is_project_member: {
        Args: { project_id_to_check: string }
        Returns: boolean
      }
      // Other functions from your schema would go here...
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "Super" | "super_admin"
      docs_progress_status:
        | "Not Started"
        | "In Analysis-TA"
        | "In Progress"
        | "Ready or Test Cases"
        | "Handover"
        | "Not Applicable"
      task_priority: "Blocker" | "Critical" | "High" | "Medium" | "Low"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// User-added constants for convenience
export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "Super", "super_admin"],
      docs_progress_status: [
        "Not Started",
        "In Analysis-TA",
        "In Progress",
        "Ready or Test Cases",
        "Handover",
        "Not Applicable",
      ],
      task_priority: ["Blocker", "Critical", "High", "Medium", "Low"],
    },
  },
} as const

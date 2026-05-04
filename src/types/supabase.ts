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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          project_id: string | null
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          project_id?: string | null
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          icon: string | null
          type: string | null
          link: string | null
          is_read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          icon?: string | null
          type?: string | null
          link?: string | null
          is_read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          icon?: string | null
          type?: string | null
          link?: string | null
          is_read?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          task_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          task_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          task_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          color: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          color?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          color?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_members: {
        Row: {
          capacity: number | null
          id: string
          mood: string | null
          project_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          capacity?: number | null
          id?: string
          mood?: string | null
          project_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          capacity?: number | null
          id?: string
          mood?: string | null
          project_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          color: string | null
          columns: Json | null
          created_at: string | null
          current_sprint_id: string | null
          description: string | null
          health_score: number | null
          icon: string | null
          id: string
          labels: Json | null
          name: string
          updated_at: string | null
          workspace_id: string | null
          invite_code: string | null
        }
        Insert: {
          color?: string | null
          columns?: Json | null
          created_at?: string | null
          current_sprint_id?: string | null
          description?: string | null
          health_score?: number | null
          icon?: string | null
          id?: string
          labels?: Json | null
          name: string
          updated_at?: string | null
          workspace_id?: string | null
          invite_code?: string | null
        }
        Update: {
          color?: string | null
          columns?: Json | null
          created_at?: string | null
          current_sprint_id?: string | null
          description?: string | null
          health_score?: number | null
          icon?: string | null
          id?: string
          labels?: Json | null
          name?: string
          updated_at?: string | null
          workspace_id?: string | null
          invite_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sprints: {
        Row: {
          created_at: string | null
          end_date: string | null
          goal: string | null
          id: string
          name: string
          project_id: string | null
          retrospective: Json | null
          start_date: string | null
          status: string | null
          velocity: number | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          goal?: string | null
          id?: string
          name: string
          project_id?: string | null
          retrospective?: Json | null
          start_date?: string | null
          status?: string | null
          velocity?: number | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          goal?: string | null
          id?: string
          name?: string
          project_id?: string | null
          retrospective?: Json | null
          start_date?: string | null
          status?: string | null
          velocity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sprints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_ids: string[] | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          labels: string[] | null
          order_index: number | null
          parent_id: string | null
          priority: string | null
          project_id: string | null
          sprint_id: string | null
          start_date: string | null
          status: string
          story_points: number | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          assignee_ids?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          labels?: string[] | null
          order_index?: number | null
          parent_id?: string | null
          priority?: string | null
          project_id?: string | null
          sprint_id?: string | null
          start_date?: string | null
          status?: string
          story_points?: number | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          assignee_ids?: string[] | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          labels?: string[] | null
          order_index?: number | null
          parent_id?: string | null
          priority?: string | null
          project_id?: string | null
          sprint_id?: string | null
          start_date?: string | null
          status?: string
          story_points?: number | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey"
            columns: ["owner_id"]
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

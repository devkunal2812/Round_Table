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
      profiles: {
        Row: {
          id: string
          created_at: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          role: string | null
          bio: string | null
        }
        Insert: {
          id: string
          created_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          bio?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          bio?: string | null
        }
      }
      goals: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          description: string | null
          progress: number
          priority: 'Low' | 'Medium' | 'High'
          due_date: string | null
          niche: string | null
          completed: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          description?: string | null
          progress?: number
          priority?: 'Low' | 'Medium' | 'High'
          due_date?: string | null
          niche?: string | null
          completed?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          description?: string | null
          progress?: number
          priority?: 'Low' | 'Medium' | 'High'
          due_date?: string | null
          niche?: string | null
          completed?: boolean
        }
      }
      tasks: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          description: string | null
          priority: 'Low' | 'Medium' | 'High'
          status: 'To Do' | 'In Progress' | 'Completed'
          due_date: string | null
          assignee: string | null
          department: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          description?: string | null
          priority?: 'Low' | 'Medium' | 'High'
          status?: 'To Do' | 'In Progress' | 'Completed'
          due_date?: string | null
          assignee?: string | null
          department?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          description?: string | null
          priority?: 'Low' | 'Medium' | 'High'
          status?: 'To Do' | 'In Progress' | 'Completed'
          due_date?: string | null
          assignee?: string | null
          department?: string | null
        }
      }
      spaces: {
        Row: {
          id: string
          created_at: string
          owner_id: string
          name: string
          description: string | null
          cover_image_url: string | null
          is_public: boolean
          invite_code: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          owner_id: string
          name: string
          description?: string | null
          cover_image_url?: string | null
          is_public?: boolean
          invite_code?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          owner_id?: string
          name?: string
          description?: string | null
          cover_image_url?: string | null
          is_public?: boolean
          invite_code?: string | null
        }
      }
      space_members: {
        Row: {
          id: string
          created_at: string
          space_id: string
          user_id: string
          role: 'admin' | 'member'
        }
        Insert: {
          id?: string
          created_at?: string
          space_id: string
          user_id: string
          role?: 'admin' | 'member'
        }
        Update: {
          id?: string
          created_at?: string
          space_id?: string
          user_id?: string
          role?: 'admin' | 'member'
        }
      }
      resources: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          description: string | null
          link: string | null
          type: 'article' | 'video' | 'doc' | 'link'
          niche: string | null
          likes: number
          space_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          description?: string | null
          link?: string | null
          type?: 'article' | 'video' | 'doc' | 'link'
          niche?: string | null
          likes?: number
          space_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          description?: string | null
          link?: string | null
          type?: 'article' | 'video' | 'doc' | 'link'
          niche?: string | null
          likes?: number
          space_id?: string | null
        }
      }
      showcase_projects: {
        Row: {
          id: string
          created_at: string
          user_id: string
          title: string
          description: string | null
          project_link: string | null
          github_link: string | null
          cover_image_url: string | null
          tags: string[]
          likes: number
          niche: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          title: string
          description?: string | null
          project_link?: string | null
          github_link?: string | null
          cover_image_url?: string | null
          tags?: string[]
          likes?: number
          niche?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          title?: string
          description?: string | null
          project_link?: string | null
          github_link?: string | null
          cover_image_url?: string | null
          tags?: string[]
          likes?: number
          niche?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          user_id: string
          type: 'task' | 'message' | 'system'
          title: string
          description: string
          read: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          type: 'task' | 'message' | 'system'
          title: string
          description: string
          read?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          type?: 'task' | 'message' | 'system'
          title?: string
          description?: string
          read?: boolean
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

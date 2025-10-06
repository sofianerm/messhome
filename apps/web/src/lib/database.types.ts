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
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'parent' | 'child'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'parent' | 'child'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'parent' | 'child'
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          text: string
          color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          text: string
          color?: 'yellow' | 'blue' | 'green' | 'pink' | 'purple'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          text?: string
          color?: 'yellow' | 'blue' | 'green' | 'pink' | 'purple'
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          user_id: string
          title: string
          date: string
          time: string | null
          type: 'rdv' | 'anniversaire' | 'autre'
          person: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          date: string
          time?: string | null
          type?: 'rdv' | 'anniversaire' | 'autre'
          person?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          date?: string
          time?: string | null
          type?: 'rdv' | 'anniversaire' | 'autre'
          person?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shopping_items: {
        Row: {
          id: string
          user_id: string
          name: string
          checked: boolean
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          checked?: boolean
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          checked?: boolean
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      meals: {
        Row: {
          id: string
          user_id: string
          date: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          title: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          title: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
          title?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          completed: boolean
          assigned_to: string | null
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          completed?: boolean
          assigned_to?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          completed?: boolean
          assigned_to?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      favorite_meals: {
        Row: {
          id: string
          user_id: string | null
          name: string
          category: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          category?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          category?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      family_settings: {
        Row: {
          id: string
          family_name: string
          home_address: string | null
          family_photo_url: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          doctor_name: string | null
          doctor_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_name?: string
          home_address?: string | null
          family_photo_url?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_name?: string
          home_address?: string | null
          family_photo_url?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      family_members: {
        Row: {
          id: string
          user_id: string | null
          first_name: string
          last_name: string
          role: 'papa' | 'maman' | 'enfant' | 'autre'
          birth_date: string | null
          email: string | null
          phone: string | null
          avatar_url: string | null
          color: string
          allergies: string | null
          dietary_preferences: string | null
          whatsapp_notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          first_name: string
          last_name: string
          role: 'papa' | 'maman' | 'enfant' | 'autre'
          birth_date?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          color?: string
          allergies?: string | null
          dietary_preferences?: string | null
          whatsapp_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          first_name?: string
          last_name?: string
          role?: 'papa' | 'maman' | 'enfant' | 'autre'
          birth_date?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          color?: string
          allergies?: string | null
          dietary_preferences?: string | null
          whatsapp_notifications?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      films: {
        Row: {
          id: string
          user_id: string | null
          titre: string
          genre: string | null
          annee: number | null
          duree: number | null
          note: number | null
          statut: 'a-voir' | 'en-cours' | 'vu'
          date_vue: string | null
          commentaire: string | null
          poster: string | null
          tmdb_id: number | null
          overview: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          titre: string
          genre?: string | null
          annee?: number | null
          duree?: number | null
          note?: number | null
          statut?: 'a-voir' | 'en-cours' | 'vu'
          date_vue?: string | null
          commentaire?: string | null
          poster?: string | null
          tmdb_id?: number | null
          overview?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          titre?: string
          genre?: string | null
          annee?: number | null
          duree?: number | null
          note?: number | null
          statut?: 'a-voir' | 'en-cours' | 'vu'
          date_vue?: string | null
          commentaire?: string | null
          poster?: string | null
          tmdb_id?: number | null
          overview?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string | null
          destination: string
          start_date: string
          end_date: string | null
          type: 'voyage' | 'weekend'
          status: 'idea' | 'planned' | 'booked' | 'done'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          destination: string
          start_date: string
          end_date?: string | null
          type?: 'voyage' | 'weekend'
          status?: 'idea' | 'planned' | 'booked' | 'done'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          destination?: string
          start_date?: string
          end_date?: string | null
          type?: 'voyage' | 'weekend'
          status?: 'idea' | 'planned' | 'booked' | 'done'
          created_at?: string
          updated_at?: string
        }
      }
      packing_items: {
        Row: {
          id: string
          user_id: string | null
          item: string
          category: string | null
          category_order: number
          checked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          item: string
          category?: string | null
          category_order?: number
          checked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          item?: string
          category?: string | null
          category_order?: number
          checked?: boolean
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
  }
}

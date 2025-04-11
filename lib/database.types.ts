export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = "donor" | "ngo" | "admin" | "volunteer"
export type DonationStatus = "pending" | "accepted" | "rejected" | "scheduled" | "picked" | "delivered" | "cancelled"
export type ComplaintStatus = "open" | "in_progress" | "resolved" | "closed"
export type VolunteerAssignmentStatus = "assigned" | "accepted" | "in_progress" | "completed" | "cancelled"

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: UserRole
          avatar_url: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          role: UserRole
          avatar_url?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: UserRole
          avatar_url?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ngos: {
        Row: {
          id: string
          organization_name: string
          registration_number: string
          description: string | null
          website: string | null
          service_areas: string[] | null
          capacity: number | null
          verified: boolean
          verification_document_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_name: string
          registration_number: string
          description?: string | null
          website?: string | null
          service_areas?: string[] | null
          capacity?: number | null
          verified?: boolean
          verification_document_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_name?: string
          registration_number?: string
          description?: string | null
          website?: string | null
          service_areas?: string[] | null
          capacity?: number | null
          verified?: boolean
          verification_document_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      donors: {
        Row: {
          id: string
          business_name: string
          business_type: string
          license_number: string | null
          license_document_url: string | null
          operating_hours: Json | null
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          business_name: string
          business_type: string
          license_number?: string | null
          license_document_url?: string | null
          operating_hours?: Json | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          business_type?: string
          license_number?: string | null
          license_document_url?: string | null
          operating_hours?: Json | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      volunteers: {
        Row: {
          id: string
          availability: Json | null
          vehicle_type: string | null
          service_areas: string[] | null
          max_distance: number | null
          verified: boolean
          verification_document_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          availability?: Json | null
          vehicle_type?: string | null
          service_areas?: string[] | null
          max_distance?: number | null
          verified?: boolean
          verification_document_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          availability?: Json | null
          vehicle_type?: string | null
          service_areas?: string[] | null
          max_distance?: number | null
          verified?: boolean
          verification_document_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      food_donations: {
        Row: {
          id: string
          donor_id: string
          ngo_id: string | null
          title: string
          description: string | null
          quantity_total: number
          quantity_unit: string
          preparation_time: string | null
          expiry_time: string
          pickup_location: string
          pickup_notes: string | null
          status: DonationStatus
          status_updated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donor_id: string
          ngo_id?: string | null
          title: string
          description?: string | null
          quantity_total: number
          quantity_unit: string
          preparation_time?: string | null
          expiry_time: string
          pickup_location: string
          pickup_notes?: string | null
          status?: DonationStatus
          status_updated_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donor_id?: string
          ngo_id?: string | null
          title?: string
          description?: string | null
          quantity_total?: number
          quantity_unit?: string
          preparation_time?: string | null
          expiry_time?: string
          pickup_location?: string
          pickup_notes?: string | null
          status?: DonationStatus
          status_updated_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      food_items: {
        Row: {
          id: string
          donation_id: string
          name: string
          category: string
          quantity: number
          quantity_unit: string
          dietary_info: string[] | null
          allergens: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donation_id: string
          name: string
          category: string
          quantity: number
          quantity_unit: string
          dietary_info?: string[] | null
          allergens?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donation_id?: string
          name?: string
          category?: string
          quantity?: number
          quantity_unit?: string
          dietary_info?: string[] | null
          allergens?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      pickup_schedules: {
        Row: {
          id: string
          donation_id: string
          scheduled_time: string
          actual_pickup_time: string | null
          ngo_id: string
          ngo_notes: string | null
          donor_notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donation_id: string
          scheduled_time: string
          actual_pickup_time?: string | null
          ngo_id: string
          ngo_notes?: string | null
          donor_notes?: string | null
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donation_id?: string
          scheduled_time?: string
          actual_pickup_time?: string | null
          ngo_id?: string
          ngo_notes?: string | null
          donor_notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      volunteer_assignments: {
        Row: {
          id: string
          volunteer_id: string
          donation_id: string
          pickup_id: string | null
          assigned_by_id: string
          assigned_by_role: UserRole
          status: VolunteerAssignmentStatus
          pickup_address: string
          dropoff_address: string
          pickup_time: string
          dropoff_time: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          volunteer_id: string
          donation_id: string
          pickup_id?: string | null
          assigned_by_id: string
          assigned_by_role: UserRole
          status?: VolunteerAssignmentStatus
          pickup_address: string
          dropoff_address: string
          pickup_time: string
          dropoff_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          volunteer_id?: string
          donation_id?: string
          pickup_id?: string | null
          assigned_by_id?: string
          assigned_by_role?: UserRole
          status?: VolunteerAssignmentStatus
          pickup_address?: string
          dropoff_address?: string
          pickup_time?: string
          dropoff_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      donation_images: {
        Row: {
          id: string
          donation_id: string
          image_url: string
          caption: string | null
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          donation_id: string
          image_url: string
          caption?: string | null
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          donation_id?: string
          image_url?: string
          caption?: string | null
          uploaded_by?: string
          created_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          donation_id: string
          ngo_id: string
          donor_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donation_id: string
          ngo_id: string
          donor_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donation_id?: string
          ngo_id?: string
          donor_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          related_entity_type: string | null
          related_entity_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          related_entity_type?: string | null
          related_entity_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          related_entity_type?: string | null
          related_entity_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          donation_id: string | null
          sender_id: string
          recipient_id: string
          content: string
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donation_id?: string | null
          sender_id: string
          recipient_id: string
          content: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          donation_id?: string | null
          sender_id?: string
          recipient_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

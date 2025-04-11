"use client"

import type React from "react"
import { createClientComponentClient } from "@/lib/supabase"
import type { UserRole } from "@/lib/database.types"
import { useRouter } from "next/navigation"
import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react"
import { toast } from "@/components/ui/use-toast"

type User = {
  id: string
  email: string
  role: UserRole
  full_name: string
  avatar_url: string | null
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: any) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabaseRef = useRef(createClientComponentClient())
  const supabase = supabaseRef.current

  // Function to fetch user profile data
  const fetchUserProfile = useCallback(
    async (userId: string) => {
      try {
        const { data: userData, error } = await supabase.from("users").select("*").eq("id", userId).single()

        if (error) {
          console.error("Error fetching user profile:", error)
          return null
        }

        if (userData) {
          return {
            id: userData.id,
            email: userData.email,
            role: userData.role,
            full_name: userData.full_name,
            avatar_url: userData.avatar_url,
          }
        }

        return null
      } catch (error) {
        console.error("Error in fetchUserProfile:", error)
        return null
      }
    },
    [supabase],
  )

  // Function to refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const userData = await fetchUserProfile(session.user.id)
        if (userData) {
          setUser(userData)
        }
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
    }
  }, [supabase, fetchUserProfile])

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)

        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const userData = await fetchUserProfile(session.user.id)
          if (userData) {
            setUser(userData)
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          const userData = await fetchUserProfile(session.user.id)
          if (userData) {
            setUser(userData)
          }
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }

      // Refresh the page to update server components
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchUserProfile, router])

  // Sign in function with improved error handling
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password. Please try again.")
        } else if (error.message.includes("Email not confirmed")) {
          throw new Error("Please verify your email before signing in.")
        } else {
          throw error
        }
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })
    } catch (error: any) {
      console.error("Sign in error:", error)
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message || "An error occurred during sign in.",
      })
      throw error
    }
  }

  // Sign up function with improved error handling and role-specific profile creation
  const signUp = async (email: string, password: string, userData: any) => {
    try {
      // Create auth user
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            role: userData.role,
            full_name: userData.full_name,
          },
        },
      })

      if (signUpError) throw signUpError

      if (!data.user) {
        throw new Error("User creation failed")
      }

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email: email,
        full_name: userData.full_name,
        role: userData.role,
        phone: userData.phone || null,
        address: userData.address || null,
        city: userData.city || null,
        state: userData.state || null,
        zip_code: userData.zip_code || null,
      })

      if (profileError) throw profileError

      // Create role-specific profile
      if (userData.role === "donor") {
        const { error: donorError } = await supabase.from("donors").insert({
          id: data.user.id,
          business_name: userData.business_name,
          business_type: userData.business_type,
        })

        if (donorError) throw donorError
      } else if (userData.role === "ngo") {
        const { error: ngoError } = await supabase.from("ngos").insert({
          id: data.user.id,
          organization_name: userData.organization_name,
          registration_number: userData.registration_number,
        })

        if (ngoError) throw ngoError
      } else if (userData.role === "volunteer") {
        const { error: volunteerError } = await supabase.from("volunteers").insert({
          id: data.user.id,
          vehicle_type: userData.vehicle_type || null,
          service_areas: userData.service_areas || null,
          max_distance: userData.max_distance || null,
        })

        if (volunteerError) throw volunteerError
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      })
    } catch (error: any) {
      console.error("Sign up error:", error)

      // Handle specific error cases
      if (error.message.includes("already registered")) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: "This email is already registered. Please sign in instead.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message || "An error occurred during registration.",
        })
      }

      throw error
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push("/")
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error: any) {
      console.error("Sign out error:", error)
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out.",
      })
    }
  }

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) throw new Error("No user logged in")

      const { error } = await supabase
        .from("users")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      // Update local user state
      setUser((prev) => (prev ? { ...prev, ...data } : null))

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error: any) {
      console.error("Update profile error:", error)
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "An error occurred while updating your profile.",
      })
      throw error
    }
  }

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      refreshUser,
    }),
    [user, loading, refreshUser],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

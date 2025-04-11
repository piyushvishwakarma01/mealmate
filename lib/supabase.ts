import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Global instance that persists across function calls
let supabaseClientInstance: ReturnType<typeof createClient<Database>> | null = null

// For client-side usage with proper singleton pattern
export const createClientComponentClient = () => {
  if (supabaseClientInstance !== null) {
    return supabaseClientInstance
  }

  // Ensure environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Missing Supabase environment variables")
    throw new Error("Missing Supabase environment variables")
  }

  supabaseClientInstance = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'mealmate-auth-storage',
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    },
  )

  return supabaseClientInstance
}

// For server-side usage
export const createServerComponentClient = () => {
  // Ensure environment variables are available
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase environment variables for server")
    throw new Error("Missing Supabase environment variables for server")
  }

  return createClient<Database>(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
    },
  })
}

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || user.role !== "admin") return

      try {
        const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

        if (error) throw error
        setUsers(data || [])
        setFilteredUsers(data || [])
      } catch (err: any) {
        console.error("Error fetching users:", err)
        setError(err.message || "Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [user, supabase])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.full_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "donor":
        return "secondary"
      case "ngo":
        return "default"
      case "admin":
        return "outline"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Users</h2>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search users..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center mt-1">
                      <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                        {user.role}
                      </Badge>
                      {!user.is_active && (
                        <Badge variant="destructive" className="ml-2">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Link href={`/dashboard/users/${user.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalNgos: 0,
    totalDonations: 0,
    pendingDonations: 0,
    completedDonations: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || user.role !== "admin") return

      try {
        // Fetch user stats
        const { data: usersData, error: usersError } = await supabase.from("users").select("id, role")

        if (usersError) throw usersError

        const totalUsers = usersData.length
        const totalDonors = usersData.filter((u) => u.role === "donor").length
        const totalNgos = usersData.filter((u) => u.role === "ngo").length

        // Fetch donation stats
        const { data: donationsData, error: donationsError } = await supabase
          .from("food_donations")
          .select("id, status")

        if (donationsError) throw donationsError

        const totalDonations = donationsData.length
        const pendingDonations = donationsData.filter((d) => d.status === "pending").length
        const completedDonations = donationsData.filter((d) => d.status === "delivered").length

        setStats({
          totalUsers,
          totalDonors,
          totalNgos,
          totalDonations,
          pendingDonations,
          completedDonations,
        })

        // Fetch recent users
        const { data: recentData, error: recentError } = await supabase
          .from("users")
          .select("id, full_name, email, role, created_at")
          .order("created_at", { ascending: false })
          .limit(5)

        if (recentError) throw recentError
        setRecentUsers(recentData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, supabase])

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDonors} Donors, {stats.totalNgos} NGOs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDonations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingDonations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedDonations}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Recent Users</CardTitle>
          <Link href="/dashboard/users">
            <Button>View All Users</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentUsers.length > 0 ? (
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-sm text-muted-foreground capitalize">Role: {user.role}</p>
                  </div>
                  <Link href={`/dashboard/users/${user.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function DonorDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalDonations: 0,
    pendingDonations: 0,
    acceptedDonations: 0,
    completedDonations: 0,
  })
  const [recentDonations, setRecentDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        // Fetch donation stats
        const { data: donationsData, error: donationsError } = await supabase
          .from("food_donations")
          .select("id, status")
          .eq("donor_id", user.id)

        if (donationsError) throw donationsError

        const totalDonations = donationsData.length
        const pendingDonations = donationsData.filter((d) => d.status === "pending").length
        const acceptedDonations = donationsData.filter((d) =>
          ["accepted", "scheduled", "picked"].includes(d.status),
        ).length
        const completedDonations = donationsData.filter((d) => d.status === "delivered").length

        setStats({
          totalDonations,
          pendingDonations,
          acceptedDonations,
          completedDonations,
        })

        // Fetch recent donations
        const { data: recentData, error: recentError } = await supabase
          .from("food_donations")
          .select(`
            id, 
            title, 
            status, 
            created_at,
            ngo_id,
            ngos(organization_name)
          `)
          .eq("donor_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (recentError) throw recentError
        setRecentDonations(recentData)
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingDonations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.acceptedDonations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedDonations}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          {recentDonations.length > 0 ? (
            <div className="space-y-4">
              {recentDonations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{donation.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: <span className="capitalize">{donation.status}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {donation.ngo_id ? `Accepted by: ${donation.ngos?.organization_name}` : "Not yet accepted"}
                    </p>
                  </div>
                  <Link href={`/dashboard/donations/${donation.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No donations yet</p>
              <Link href="/dashboard/create-donation">
                <Button className="mt-2">Create Your First Donation</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

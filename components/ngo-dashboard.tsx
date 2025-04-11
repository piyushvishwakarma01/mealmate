"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function NgoDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    availableDonations: 0,
    acceptedDonations: 0,
    scheduledPickups: 0,
    completedDonations: 0,
  })
  const [recentDonations, setRecentDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        // Fetch available donations (not accepted by any NGO)
        const { data: availableData, error: availableError } = await supabase
          .from("food_donations")
          .select("id")
          .is("ngo_id", null)
          .eq("status", "pending")

        if (availableError) throw availableError

        // Fetch accepted donations by this NGO
        const { data: acceptedData, error: acceptedError } = await supabase
          .from("food_donations")
          .select("id, status")
          .eq("ngo_id", user.id)

        if (acceptedError) throw acceptedError

        const acceptedDonations = acceptedData.length
        const scheduledPickups = acceptedData.filter((d) => d.status === "scheduled").length
        const completedDonations = acceptedData.filter((d) => d.status === "delivered").length

        setStats({
          availableDonations: availableData.length,
          acceptedDonations,
          scheduledPickups,
          completedDonations,
        })

        // Fetch recent accepted donations
        const { data: recentData, error: recentError } = await supabase
          .from("food_donations")
          .select(`
            id, 
            title, 
            status, 
            created_at,
            donor_id,
            donors(business_name)
          `)
          .eq("ngo_id", user.id)
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
            <CardTitle className="text-sm font-medium">Available Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableDonations}</div>
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
            <CardTitle className="text-sm font-medium">Scheduled Pickups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledPickups}</div>
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
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Recent Accepted Donations</CardTitle>
          <Link href="/dashboard/available-donations">
            <Button>Browse Available Donations</Button>
          </Link>
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
                    <p className="text-sm text-muted-foreground">Donor: {donation.donors?.business_name}</p>
                  </div>
                  <Link href={`/dashboard/accepted-donations/${donation.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No accepted donations yet</p>
              <Link href="/dashboard/available-donations">
                <Button className="mt-2">Browse Available Donations</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

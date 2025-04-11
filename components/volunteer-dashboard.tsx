"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { Bike, Clock, CheckCircle, MapPin, Calendar } from "lucide-react"

export function VolunteerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalAssignments: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    todayAssignments: 0,
  })
  const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return

      try {
        // Fetch assignment stats
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from("volunteer_assignments")
          .select("id, status, pickup_time")
          .eq("volunteer_id", user.id)

        if (assignmentsError) throw assignmentsError

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const totalAssignments = assignmentsData.length
        const pendingAssignments = assignmentsData.filter((a) =>
          ["assigned", "accepted", "in_progress"].includes(a.status),
        ).length
        const completedAssignments = assignmentsData.filter((a) => a.status === "completed").length
        const todayAssignments = assignmentsData.filter((a) => {
          const pickupDate = new Date(a.pickup_time)
          pickupDate.setHours(0, 0, 0, 0)
          return pickupDate.getTime() === today.getTime()
        }).length

        setStats({
          totalAssignments,
          pendingAssignments,
          completedAssignments,
          todayAssignments,
        })

        // Fetch upcoming assignments
        const { data: upcomingData, error: upcomingError } = await supabase
          .from("volunteer_assignments")
          .select(`
            id, 
            status, 
            pickup_time,
            pickup_address,
            dropoff_address,
            notes,
            donation_id,
            food_donations(
              title,
              donor_id,
              donors(business_name)
            )
          `)
          .eq("volunteer_id", user.id)
          .in("status", ["assigned", "accepted", "in_progress"])
          .order("pickup_time", { ascending: true })
          .limit(5)

        if (upcomingError) throw upcomingError
        setUpcomingAssignments(upcomingData || [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, supabase])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "assigned":
        return "secondary"
      case "accepted":
        return "default"
      case "in_progress":
        return "warning"
      case "completed":
        return "success"
      case "cancelled":
        return "destructive"
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Bike className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAssignments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAssignments}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Upcoming Assignments</CardTitle>
          <Link href="/dashboard/assignments">
            <Button>View All Assignments</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {upcomingAssignments.length > 0 ? (
            <div className="space-y-6">
              {upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="rounded-lg border p-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{assignment.food_donations?.title}</h3>
                        <Badge variant={getStatusBadgeVariant(assignment.status)} className="capitalize">
                          {assignment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        From: {assignment.food_donations?.donors?.business_name}
                      </p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium">Pickup</p>
                            <p className="text-sm">{assignment.pickup_address}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium">Dropoff</p>
                            <p className="text-sm">{assignment.dropoff_address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <div className="text-sm font-medium">
                        {format(new Date(assignment.pickup_time), "MMM d, yyyy")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(assignment.pickup_time), "h:mm a")}
                      </div>
                      <Link href={`/dashboard/assignments/${assignment.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bike className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-2 text-lg font-medium">No upcoming assignments</h3>
              <p className="text-sm text-muted-foreground">You don't have any pending assignments at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

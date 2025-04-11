"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import { MapPin, Calendar, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import type { VolunteerAssignmentStatus } from "@/lib/database.types"

export default function AssignmentsPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("upcoming")
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user || user.role !== "volunteer") return

      try {
        const { data, error } = await supabase
          .from("volunteer_assignments")
          .select(`
            id, 
            status, 
            pickup_time,
            dropoff_time,
            pickup_address,
            dropoff_address,
            notes,
            donation_id,
            assigned_by_id,
            assigned_by_role,
            food_donations(
              title,
              donor_id,
              donors(business_name),
              ngo_id,
              ngos(organization_name)
            ),
            users!assigned_by_id(full_name)
          `)
          .eq("volunteer_id", user.id)
          .order("pickup_time", { ascending: true })

        if (error) throw error
        setAssignments(data || [])
      } catch (err: any) {
        console.error("Error fetching assignments:", err)
        setError(err.message || "Failed to load assignments")
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()

    // Set up real-time subscription
    const subscription = supabase
      .channel("assignments_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "volunteer_assignments",
          filter: `volunteer_id=eq.${user?.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch the complete assignment with joins
            fetchAssignmentById(payload.new.id)
          } else if (payload.eventType === "UPDATE") {
            setAssignments((prev) =>
              prev.map((assignment) =>
                assignment.id === payload.new.id ? { ...assignment, ...payload.new } : assignment,
              ),
            )
          } else if (payload.eventType === "DELETE") {
            setAssignments((prev) => prev.filter((assignment) => assignment.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, user])

  const fetchAssignmentById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("volunteer_assignments")
        .select(`
          id, 
          status, 
          pickup_time,
          dropoff_time,
          pickup_address,
          dropoff_address,
          notes,
          donation_id,
          assigned_by_id,
          assigned_by_role,
          food_donations(
            title,
            donor_id,
            donors(business_name),
            ngo_id,
            ngos(organization_name)
          ),
          users!assigned_by_id(full_name)
        `)
        .eq("id", id)
        .single()

      if (error) throw error

      if (data) {
        setAssignments((prev) => [data, ...prev])
      }
    } catch (error) {
      console.error("Error fetching assignment by ID:", error)
    }
  }

  const updateAssignmentStatus = async (id: string, status: VolunteerAssignmentStatus) => {
    try {
      const { error } = await supabase
        .from("volunteer_assignments")
        .update({
          status,
          ...(status === "completed" ? { dropoff_time: new Date().toISOString() } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      // Update local state
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === id
            ? {
                ...assignment,
                status,
                ...(status === "completed" ? { dropoff_time: new Date().toISOString() } : {}),
                updated_at: new Date().toISOString(),
              }
            : assignment,
        ),
      )
    } catch (err: any) {
      console.error("Error updating assignment status:", err)
      setError(err.message || "Failed to update assignment status")
    }
  }

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

  const filteredAssignments = assignments.filter((assignment) => {
    if (activeTab === "upcoming") {
      return ["assigned", "accepted", "in_progress"].includes(assignment.status)
    } else if (activeTab === "completed") {
      return assignment.status === "completed"
    } else if (activeTab === "cancelled") {
      return assignment.status === "cancelled"
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Assignments</h1>
          <p className="text-muted-foreground">Manage your food delivery assignments</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No {activeTab} assignments found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredAssignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle>{assignment.food_donations?.title}</CardTitle>
                          <Badge variant={getStatusBadgeVariant(assignment.status)} className="capitalize">
                            {assignment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Assigned by: {assignment.users?.full_name} ({assignment.assigned_by_role})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{format(new Date(assignment.pickup_time), "MMM d, yyyy")}</span>
                        <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{format(new Date(assignment.pickup_time), "h:mm a")}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium">Pickup Details</h3>
                          <div className="mt-1 flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div>
                              <p className="text-sm">{assignment.pickup_address}</p>
                              <p className="text-xs text-muted-foreground">
                                From: {assignment.food_donations?.donors?.business_name}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium">Dropoff Details</h3>
                          <div className="mt-1 flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div>
                              <p className="text-sm">{assignment.dropoff_address}</p>
                              <p className="text-xs text-muted-foreground">
                                To: {assignment.food_donations?.ngos?.organization_name}
                              </p>
                            </div>
                          </div>
                        </div>

                        {assignment.notes && (
                          <div>
                            <h3 className="text-sm font-medium">Notes</h3>
                            <p className="mt-1 text-sm">{assignment.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 justify-end">
                        {assignment.status === "assigned" && (
                          <Button
                            onClick={() => updateAssignmentStatus(assignment.id, "accepted")}
                            className="w-full md:w-auto md:self-end"
                          >
                            Accept Assignment
                          </Button>
                        )}

                        {assignment.status === "accepted" && (
                          <Button
                            onClick={() => updateAssignmentStatus(assignment.id, "in_progress")}
                            className="w-full md:w-auto md:self-end"
                          >
                            Start Delivery
                          </Button>
                        )}

                        {assignment.status === "in_progress" && (
                          <Button
                            onClick={() => updateAssignmentStatus(assignment.id, "completed")}
                            className="w-full md:w-auto md:self-end"
                          >
                            Complete Delivery
                          </Button>
                        )}

                        {["assigned", "accepted"].includes(assignment.status) && (
                          <Button
                            variant="outline"
                            onClick={() => updateAssignmentStatus(assignment.id, "cancelled")}
                            className="w-full md:w-auto md:self-end"
                          >
                            Cancel Assignment
                          </Button>
                        )}

                        <Link href={`/dashboard/assignments/${assignment.id}`} className="w-full md:w-auto md:self-end">
                          <Button variant="secondary" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

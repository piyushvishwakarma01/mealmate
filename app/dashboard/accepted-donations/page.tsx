"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export default function AcceptedDonationsPage() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchAcceptedDonations = async () => {
      if (!user || user.role !== "ngo") return

      try {
        const { data, error } = await supabase
          .from("food_donations")
          .select(`
            id,
            title,
            description,
            quantity_total,
            quantity_unit,
            expiry_time,
            pickup_location,
            status,
            created_at,
            donor_id,
            donors(business_name)
          `)
          .eq("ngo_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setDonations(data || [])
      } catch (err: any) {
        console.error("Error fetching accepted donations:", err)
        setError(err.message || "Failed to load accepted donations")
      } finally {
        setLoading(false)
      }
    }

    fetchAcceptedDonations()
  }, [user, supabase])

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "accepted":
        return "default"
      case "scheduled":
        return "outline"
      case "picked":
        return "default"
      case "delivered":
        return "default"
      case "rejected":
        return "destructive"
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Accepted Donations</h2>
        <Link href="/dashboard/available-donations">
          <Button>Browse Available Donations</Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {donations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">You haven't accepted any donations yet</p>
            <Link href="/dashboard/available-donations">
              <Button className="mt-4">Browse Available Donations</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {donations.map((donation) => (
            <Card key={donation.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="mr-2">{donation.title}</CardTitle>
                  <Badge variant={getStatusBadgeVariant(donation.status)}>
                    {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription>
                  From {donation.donors?.business_name} •{" "}
                  {formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Description:</p>
                    <p className="text-sm">{donation.description || "No description provided"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {donation.quantity_total} {donation.quantity_unit}
                    </Badge>
                    <Badge variant="outline" className="bg-yellow-50">
                      Expires: {new Date(donation.expiry_time).toLocaleDateString()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup Location:</p>
                    <p className="text-sm">{donation.pickup_location}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/dashboard/accepted-donations/${donation.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

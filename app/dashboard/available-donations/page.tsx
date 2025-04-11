"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDistanceToNow } from "date-fns"

export default function AvailableDonationsPage() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchAvailableDonations = async () => {
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
            pickup_notes,
            created_at,
            donor_id,
            donors(business_name)
          `)
          .is("ngo_id", null)
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        if (error) throw error
        setDonations(data || [])
      } catch (err: any) {
        console.error("Error fetching available donations:", err)
        setError(err.message || "Failed to load available donations")
      } finally {
        setLoading(false)
      }
    }

    fetchAvailableDonations()
  }, [user, supabase])

  const handleAcceptDonation = async (donationId: string) => {
    if (!user || user.role !== "ngo") return

    setAcceptingId(donationId)
    setError(null)

    try {
      const { error } = await supabase
        .from("food_donations")
        .update({
          ngo_id: user.id,
          status: "accepted",
          status_updated_at: new Date().toISOString(),
        })
        .eq("id", donationId)

      if (error) throw error

      // Update local state
      setDonations(donations.filter((donation) => donation.id !== donationId))
    } catch (err: any) {
      console.error("Error accepting donation:", err)
      setError(err.message || "Failed to accept donation")
    } finally {
      setAcceptingId(null)
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
        <h2 className="text-2xl font-bold">Available Donations</h2>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {donations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">No available donations at the moment</p>
            <p className="text-sm text-muted-foreground mt-2">Check back later for new donations</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {donations.map((donation) => (
            <Card key={donation.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{donation.title}</CardTitle>
                <CardDescription>
                  By {donation.donors?.business_name} •{" "}
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
                <Button
                  className="w-full"
                  onClick={() => handleAcceptDonation(donation.id)}
                  disabled={acceptingId === donation.id}
                >
                  {acceptingId === donation.id ? "Accepting..." : "Accept Donation"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

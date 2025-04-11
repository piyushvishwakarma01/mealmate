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
import { formatDistanceToNow } from "date-fns"

export default function AllDonationsPage() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<any[]>([])
  const [filteredDonations, setFilteredDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchDonations = async () => {
      if (!user || user.role !== "admin") return

      try {
        const { data, error } = await supabase
          .from("food_donations")
          .select(`
            id,
            title,
            status,
            created_at,
            donor_id,
            donors(business_name),
            ngo_id,
            ngos(organization_name)
          `)
          .order("created_at", { ascending: false })

        if (error) throw error
        setDonations(data || [])
        setFilteredDonations(data || [])
      } catch (err: any) {
        console.error("Error fetching donations:", err)
        setError(err.message || "Failed to load donations")
      } finally {
        setLoading(false)
      }
    }

    fetchDonations()
  }, [user, supabase])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDonations(donations)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = donations.filter(
        (donation) =>
          donation.title.toLowerCase().includes(query) ||
          donation.status.toLowerCase().includes(query) ||
          donation.donors?.business_name.toLowerCase().includes(query) ||
          (donation.ngos?.organization_name && donation.ngos.organization_name.toLowerCase().includes(query)),
      )
      setFilteredDonations(filtered)
    }
  }, [searchQuery, donations])

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
        <h2 className="text-2xl font-bold">All Donations</h2>
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
          placeholder="Search donations..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Donations ({filteredDonations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDonations.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No donations found</p>
              </div>
            ) : (
              filteredDonations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{donation.title}</p>
                    <p className="text-sm text-muted-foreground">
                      From: {donation.donors?.business_name} •{" "}
                      {formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })}
                    </p>
                    <div className="flex items-center mt-1">
                      <Badge variant={getStatusBadgeVariant(donation.status)} className="capitalize">
                        {donation.status}
                      </Badge>
                      {donation.ngo_id && (
                        <p className="text-sm text-muted-foreground ml-2">
                          Accepted by: {donation.ngos?.organization_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link href={`/dashboard/all-donations/${donation.id}`}>
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

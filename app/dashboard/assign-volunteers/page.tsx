"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { Search, AlertCircle, MapPin, Calendar } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

export default function AssignVolunteersPage() {
  const { user } = useAuth()
  const [donations, setDonations] = useState<any[]>([])
  const [volunteers, setVolunteers] = useState<any[]>([])
  const [filteredDonations, setFilteredDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDonation, setSelectedDonation] = useState<any>(null)
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>("")
  const [pickupTime, setPickupTime] = useState("")
  const [notes, setNotes] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!user || (user.role !== "donor" && user.role !== "ngo")) return

      try {
        // Fetch donations based on user role
        let donationsQuery = supabase
          .from("food_donations")
          .select(`
            id,
            title,
            status,
            created_at,
            pickup_location,
            expiry_time,
            donor_id,
            donors(business_name, address, city, state, zip_code),
            ngo_id,
            ngos(organization_name, address, city, state, zip_code)
          `)
          .in("status", ["accepted", "scheduled"])

        if (user.role === "donor") {
          donationsQuery = donationsQuery.eq("donor_id", user.id)
        } else if (user.role === "ngo") {
          donationsQuery = donationsQuery.eq("ngo_id", user.id)
        }

        const { data: donationsData, error: donationsError } = await donationsQuery.order("created_at", {
          ascending: false,
        })

        if (donationsError) throw donationsError

        // Check which donations already have volunteer assignments
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from("volunteer_assignments")
          .select("donation_id")
          .in(
            "donation_id",
            donationsData.map((d) => d.id),
          )
          .not("status", "eq", "cancelled")

        if (assignmentsError) throw assignmentsError

        // Filter out donations that already have active assignments
        const assignedDonationIds = new Set(assignmentsData.map((a) => a.donation_id))
        const availableDonations = donationsData.filter((d) => !assignedDonationIds.has(d.id))

        setDonations(availableDonations)
        setFilteredDonations(availableDonations)

        // Fetch volunteers
        const { data: volunteersData, error: volunteersError } = await supabase
          .from("users")
          .select(`
            id,
            full_name,
            email,
            phone,
            city,
            state,
            volunteers(vehicle_type, service_areas, max_distance)
          `)
          .eq("role", "volunteer")
          .eq("is_active", true)

        if (volunteersError) throw volunteersError
        setVolunteers(volunteersData)
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(err.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, user])

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

  const handleAssignVolunteer = async () => {
    if (!selectedDonation || !selectedVolunteer || !pickupTime) {
      setError("Please select a donation, volunteer, and pickup time")
      return
    }

    setIsAssigning(true)
    setError(null)

    try {
      // Get donor and NGO addresses
      const donorAddress = `${selectedDonation.donors.address}, ${selectedDonation.donors.city}, ${selectedDonation.donors.state} ${selectedDonation.donors.zip_code}`
      const ngoAddress = `${selectedDonation.ngos.address}, ${selectedDonation.ngos.city}, ${selectedDonation.ngos.state} ${selectedDonation.ngos.zip_code}`

      // Create volunteer assignment
      const { error: assignmentError } = await supabase.from("volunteer_assignments").insert({
        volunteer_id: selectedVolunteer,
        donation_id: selectedDonation.id,
        assigned_by_id: user!.id,
        assigned_by_role: user!.role,
        status: "assigned",
        pickup_address: donorAddress,
        dropoff_address: ngoAddress,
        pickup_time: new Date(pickupTime).toISOString(),
        notes: notes || null,
      })

      if (assignmentError) throw assignmentError

      // Create notification for volunteer
      const { error: notificationError } = await supabase.from("notifications").insert({
        user_id: selectedVolunteer,
        title: "New Delivery Assignment",
        message: `You have been assigned to deliver ${selectedDonation.title} from ${selectedDonation.donors.business_name} to ${selectedDonation.ngos.organization_name}`,
        related_entity_type: "volunteer_assignment",
        related_entity_id: selectedDonation.id,
      })

      if (notificationError) throw notificationError

      // Remove the assigned donation from the list
      setDonations(donations.filter((d) => d.id !== selectedDonation.id))
      setFilteredDonations(filteredDonations.filter((d) => d.id !== selectedDonation.id))

      // Reset form
      setSelectedDonation(null)
      setSelectedVolunteer("")
      setPickupTime("")
      setNotes("")
      setIsDialogOpen(false)

      toast({
        title: "Volunteer assigned successfully",
        description: "The volunteer has been notified of their new assignment.",
      })
    } catch (err: any) {
      console.error("Error assigning volunteer:", err)
      setError(err.message || "Failed to assign volunteer")
    } finally {
      setIsAssigning(false)
    }
  }

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assign Volunteers</h1>
          <p className="text-muted-foreground">Assign volunteers to handle food pickup and delivery</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
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
          <CardTitle>Available Donations ({filteredDonations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDonations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No available donations found</p>
              <p className="text-sm text-muted-foreground mt-2">
                All your donations have been assigned to volunteers or there are no donations ready for volunteer
                assignment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{donation.title}</p>
                      <Badge variant={getStatusBadgeVariant(donation.status)} className="capitalize">
                        {donation.status}
                      </Badge>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>From: {donation.donors?.business_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>To: {donation.ngos?.organization_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Expires: {format(new Date(donation.expiry_time), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  <Dialog
                    open={isDialogOpen && selectedDonation?.id === donation.id}
                    onOpenChange={(open) => {
                      setIsDialogOpen(open)
                      if (!open) setSelectedDonation(null)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button onClick={() => setSelectedDonation(donation)} className="mt-2 md:mt-0">
                        Assign Volunteer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Assign Volunteer</DialogTitle>
                        <DialogDescription>
                          Select a volunteer to handle the pickup and delivery of this donation
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="donation">Donation</Label>
                          <Input id="donation" value={selectedDonation?.title} disabled />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="from">From</Label>
                            <Input id="from" value={selectedDonation?.donors?.business_name} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="to">To</Label>
                            <Input id="to" value={selectedDonation?.ngos?.organization_name} disabled />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="volunteer">Select Volunteer</Label>
                          <select
                            id="volunteer"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedVolunteer}
                            onChange={(e) => setSelectedVolunteer(e.target.value)}
                            required
                          >
                            <option value="">Select a volunteer</option>
                            {volunteers.map((volunteer) => (
                              <option key={volunteer.id} value={volunteer.id}>
                                {volunteer.full_name} - {volunteer.volunteers?.vehicle_type || "No vehicle"}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pickupTime">Pickup Time</Label>
                          <Input
                            id="pickupTime"
                            type="datetime-local"
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes (Optional)</Label>
                          <Textarea
                            id="notes"
                            placeholder="Add any special instructions for the volunteer"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="submit"
                          onClick={handleAssignVolunteer}
                          disabled={isAssigning || !selectedVolunteer || !pickupTime}
                        >
                          {isAssigning ? "Assigning..." : "Assign Volunteer"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

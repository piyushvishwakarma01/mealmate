"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import { MapPin, AlertCircle, Navigation } from "lucide-react"
import Link from "next/link"

export default function DeliveryMapPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
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
            pickup_address,
            dropoff_address,
            donation_id,
            food_donations(
              title,
              donor_id,
              donors(business_name),
              ngo_id,
              ngos(organization_name)
            )
          `)
          .eq("volunteer_id", user.id)
          .in("status", ["accepted", "in_progress"])
          .order("pickup_time", { ascending: true })

        if (error) throw error
        setAssignments(data || [])

        if (data && data.length > 0) {
          setSelectedAssignment(data[0])
        }
      } catch (err: any) {
        console.error("Error fetching assignments:", err)
        setError(err.message || "Failed to load assignments")
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [supabase, user])

  // Initialize map when component mounts
  useEffect(() => {
    // This is a placeholder for map initialization
    // In a real application, you would use a mapping library like Google Maps, Mapbox, or Leaflet
    const initMap = () => {
      if (!mapRef.current) return

      // Placeholder for map initialization
      console.log("Map would be initialized here")

      // In a real implementation, you would do something like:
      // mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      //   center: { lat: 37.7749, lng: -122.4194 },
      //   zoom: 12,
      // })
    }

    initMap()

    return () => {
      // Cleanup map instance
      mapInstanceRef.current = null
      markersRef.current = []
    }
  }, [])

  // Update map when selected assignment changes
  useEffect(() => {
    if (!selectedAssignment || !mapInstanceRef.current) return

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      // In a real implementation: marker.setMap(null)
    })
    markersRef.current = []

    // Add markers for pickup and dropoff locations
    // This is a placeholder for adding markers
    console.log("Would add markers for:", selectedAssignment.pickup_address, selectedAssignment.dropoff_address)

    // In a real implementation, you would geocode the addresses and add markers:
    // const pickupMarker = new google.maps.Marker({
    //   position: pickupLatLng,
    //   map: mapInstanceRef.current,
    //   title: "Pickup: " + selectedAssignment.food_donations.donors.business_name,
    //   icon: { url: '/images/pickup-marker.svg' }
    // })
    // markersRef.current.push(pickupMarker)

    // const dropoffMarker = new google.maps.Marker({
    //   position: dropoffLatLng,
    //   map: mapInstanceRef.current,
    //   title: "Dropoff: " + selectedAssignment.food_donations.ngos.organization_name,
    //   icon: { url: '/images/dropoff-marker.svg' }
    // })
    // markersRef.current.push(dropoffMarker)

    // Draw route between pickup and dropoff
    // const directionsService = new google.maps.DirectionsService()
    // const directionsRenderer = new google.maps.DirectionsRenderer({
    //   map: mapInstanceRef.current,
    //   suppressMarkers: true
    // })
    // directionsService.route({
    //   origin: pickupLatLng,
    //   destination: dropoffLatLng,
    //   travelMode: google.maps.TravelMode.DRIVING
    // }, (result, status) => {
    //   if (status === google.maps.DirectionsStatus.OK) {
    //     directionsRenderer.setDirections(result)
    //   }
    // })
  }, [selectedAssignment])

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

  const openInMaps = (address: string) => {
    // Open address in Google Maps
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank")
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
          <h1 className="text-2xl font-bold tracking-tight">Delivery Map</h1>
          <p className="text-muted-foreground">
            View your delivery routes and navigate to pickup and dropoff locations
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">No active assignments found</p>
            <Link href="/dashboard/assignments">
              <Button className="mt-4">View All Assignments</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAssignment?.id === assignment.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedAssignment(assignment)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{assignment.food_donations?.title}</h3>
                        <Badge variant={getStatusBadgeVariant(assignment.status)} className="capitalize">
                          {assignment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(assignment.pickup_time), "MMM d, h:mm a")}
                      </p>
                      <div className="mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>From: {assignment.food_donations?.donors?.business_name}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>To: {assignment.food_donations?.ngos?.organization_name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedAssignment && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Pickup Location</h3>
                      <p className="text-sm mt-1">{selectedAssignment.pickup_address}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => openInMaps(selectedAssignment.pickup_address)}
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        Navigate to Pickup
                      </Button>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium">Dropoff Location</h3>
                      <p className="text-sm mt-1">{selectedAssignment.dropoff_address}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => openInMaps(selectedAssignment.dropoff_address)}
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        Navigate to Dropoff
                      </Button>
                    </div>

                    <Link href={`/dashboard/assignments/${selectedAssignment.id}`} className="w-full">
                      <Button className="w-full">View Assignment Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-2">
            <Card className="h-[600px]">
              <CardContent className="p-0 h-full">
                <div ref={mapRef} className="w-full h-full bg-muted/30 flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="text-muted-foreground">Map would be displayed here</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      In a production environment, this would show an interactive map with pickup and dropoff locations
                    </p>
                    {selectedAssignment && (
                      <div className="mt-4 text-sm">
                        <p>Selected route:</p>
                        <p className="font-medium mt-1">
                          {selectedAssignment.food_donations?.donors?.business_name} →{" "}
                          {selectedAssignment.food_donations?.ngos?.organization_name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

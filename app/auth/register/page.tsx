"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Building, Users, Heart, Bike, AlertCircle } from "lucide-react"
import type { UserRole } from "@/lib/database.types"

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const defaultRole = (searchParams.get("role") as UserRole) || "donor"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [role, setRole] = useState<UserRole>(defaultRole)

  // Donor specific fields
  const [businessName, setBusinessName] = useState("")
  const [businessType, setBusinessType] = useState("")

  // NGO specific fields
  const [organizationName, setOrganizationName] = useState("")
  const [registrationNumber, setRegistrationNumber] = useState("")

  // Volunteer specific fields
  const [vehicleType, setVehicleType] = useState("")
  const [maxDistance, setMaxDistance] = useState("")
  const [serviceAreas, setServiceAreas] = useState("")

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { signUp } = useAuth()
  const router = useRouter()

  const validateForm = () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }

    // Role-specific validation
    if (role === "donor" && (!businessName || !businessType)) {
      setError("Please fill in all required business information")
      return false
    }

    if (role === "ngo" && (!organizationName || !registrationNumber)) {
      setError("Please fill in all required organization information")
      return false
    }

    if (role === "volunteer" && !vehicleType) {
      setError("Please specify your vehicle type")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const userData = {
        full_name: fullName,
        role,
        phone,
        address,
        city,
        state,
        zip_code: zipCode,
        ...(role === "donor" && {
          business_name: businessName,
          business_type: businessType,
        }),
        ...(role === "ngo" && {
          organization_name: organizationName,
          registration_number: registrationNumber,
        }),
        ...(role === "volunteer" && {
          vehicle_type: vehicleType,
          max_distance: maxDistance ? Number.parseFloat(maxDistance) : null,
          service_areas: serviceAreas ? serviceAreas.split(",").map((area) => area.trim()) : null,
        }),
      }

      await signUp(email, password, userData)
      router.push("/auth/verification-sent")
    } catch (err: any) {
      setError(err.message || "Failed to sign up")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4 py-12">
      <div className="absolute inset-0 z-0 food-pattern-bg"></div>
      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="mb-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M15 11h.01" />
                  <path d="M11 15h.01" />
                  <path d="M16 16h.01" />
                  <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
                  <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-primary">MealMate</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-center font-heading">Join MealMate</h1>
          <p className="mt-2 text-center text-muted-foreground">
            Create an account to start making a difference in reducing food waste
          </p>
        </div>

        <Card className="border-none shadow-lg overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Select your role and fill in your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="animate-fadeIn">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>I am a</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(value) => setRole(value as UserRole)}
                  className="grid grid-cols-2 gap-4 md:grid-cols-4"
                >
                  <div className="flex flex-col items-center space-y-2 rounded-md border border-border p-4 hover:bg-muted/50 cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10">
                    <RadioGroupItem value="donor" id="donor" className="sr-only" />
                    <Building className="h-6 w-6 text-primary" />
                    <Label htmlFor="donor" className="cursor-pointer font-medium">
                      Food Donor
                    </Label>
                    <span className="text-xs text-muted-foreground text-center">
                      Restaurants, cafeterias, food businesses
                    </span>
                  </div>

                  <div className="flex flex-col items-center space-y-2 rounded-md border border-border p-4 hover:bg-muted/50 cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10">
                    <RadioGroupItem value="ngo" id="ngo" className="sr-only" />
                    <Users className="h-6 w-6 text-primary" />
                    <Label htmlFor="ngo" className="cursor-pointer font-medium">
                      NGO
                    </Label>
                    <span className="text-xs text-muted-foreground text-center">
                      Non-profit organizations, charities
                    </span>
                  </div>

                  <div className="flex flex-col items-center space-y-2 rounded-md border border-border p-4 hover:bg-muted/50 cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10">
                    <RadioGroupItem value="volunteer" id="volunteer" className="sr-only" />
                    <Bike className="h-6 w-6 text-primary" />
                    <Label htmlFor="volunteer" className="cursor-pointer font-medium">
                      Volunteer
                    </Label>
                    <span className="text-xs text-muted-foreground text-center">
                      Help with food pickup and delivery
                    </span>
                  </div>

                  <div className="flex flex-col items-center space-y-2 rounded-md border border-border p-4 hover:bg-muted/50 cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10">
                    <RadioGroupItem value="admin" id="admin" className="sr-only" />
                    <Heart className="h-6 w-6 text-primary" />
                    <Label htmlFor="admin" className="cursor-pointer font-medium">
                      Admin
                    </Label>
                    <span className="text-xs text-muted-foreground text-center">Platform administrators only</span>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-background"
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">Must be at least 8 characters long</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-background"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-background"
                    disabled={isLoading}
                    autoComplete="tel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-background"
                    disabled={isLoading}
                    autoComplete="street-address"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-background"
                    disabled={isLoading}
                    autoComplete="address-level2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="bg-background"
                    disabled={isLoading}
                    autoComplete="address-level1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="bg-background"
                    disabled={isLoading}
                    autoComplete="postal-code"
                  />
                </div>
              </div>

              {/* Role-specific fields */}
              {role === "donor" && (
                <div className="space-y-4 rounded-md border border-border p-4 bg-muted/30">
                  <h3 className="font-medium">Business Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        required
                        className="bg-background"
                        disabled={isLoading}
                        autoComplete="organization"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <Input
                        id="businessType"
                        type="text"
                        placeholder="Restaurant, Cafeteria, etc."
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        required
                        className="bg-background"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              )}

              {role === "ngo" && (
                <div className="space-y-4 rounded-md border border-border p-4 bg-muted/30">
                  <h3 className="font-medium">Organization Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Organization Name</Label>
                      <Input
                        id="organizationName"
                        type="text"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        required
                        className="bg-background"
                        disabled={isLoading}
                        autoComplete="organization"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number</Label>
                      <Input
                        id="registrationNumber"
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        required
                        className="bg-background"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              )}

              {role === "volunteer" && (
                <div className="space-y-4 rounded-md border border-border p-4 bg-muted/30">
                  <h3 className="font-medium">Volunteer Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleType">Vehicle Type</Label>
                      <select
                        id="vehicleType"
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isLoading}
                      >
                        <option value="">Select vehicle type</option>
                        <option value="bicycle">Bicycle</option>
                        <option value="motorcycle">Motorcycle</option>
                        <option value="car">Car</option>
                        <option value="van">Van</option>
                        <option value="truck">Truck</option>
                        <option value="none">No vehicle (on foot)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxDistance">Maximum Distance (km)</Label>
                      <Input
                        id="maxDistance"
                        type="number"
                        min="0"
                        step="0.1"
                        value={maxDistance}
                        onChange={(e) => setMaxDistance(e.target.value)}
                        className="bg-background"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serviceAreas">Service Areas (comma separated)</Label>
                    <Input
                      id="serviceAreas"
                      type="text"
                      placeholder="Downtown, North Side, West End"
                      value={serviceAreas}
                      onChange={(e) => setServiceAreas(e.target.value)}
                      className="bg-background"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-sm text-muted-foreground mt-2 text-center">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary font-medium underline-offset-4 hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

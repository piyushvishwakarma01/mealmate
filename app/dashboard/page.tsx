"use client"

import { useAuth } from "@/contexts/auth-context"
import { DonorDashboard } from "@/components/donor-dashboard"
import { NgoDashboard } from "@/components/ngo-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"
import { VolunteerDashboard } from "@/components/volunteer-dashboard"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.full_name}</h1>
        <p className="text-muted-foreground">
          {user.role === "donor"
            ? "Manage your food donations and track their status"
            : user.role === "ngo"
              ? "Find available donations and manage pickups"
              : user.role === "volunteer"
                ? "Manage your delivery assignments and track your progress"
                : "Monitor platform activity and manage users"}
        </p>
      </div>

      <div className="space-y-4">
        {user.role === "donor" && <DonorDashboard />}
        {user.role === "ngo" && <NgoDashboard />}
        {user.role === "volunteer" && <VolunteerDashboard />}
        {user.role === "admin" && <AdminDashboard />}
      </div>
    </div>
  )
}

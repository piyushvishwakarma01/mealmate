"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Users, Package } from "lucide-react"

export default function ReportsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reportType, setReportType] = useState("donations")
  const [reportData, setReportData] = useState<any>(null)
  const supabase = createClientComponentClient()

  const generateReport = async () => {
    if (!user || user.role !== "admin") return
    if (!startDate || !endDate) {
      setError("Please select both start and end dates")
      return
    }

    setLoading(true)
    setError(null)
    setReportData(null)

    try {
      let data
      const start = new Date(startDate).toISOString()
      const end = new Date(endDate).toISOString()

      if (reportType === "donations") {
        const { data: donationsData, error: donationsError } = await supabase
          .from("food_donations")
          .select("id, status, created_at")
          .gte("created_at", start)
          .lte("created_at", end)

        if (donationsError) throw donationsError

        // Process data for report
        const statusCounts = {
          pending: 0,
          accepted: 0,
          scheduled: 0,
          picked: 0,
          delivered: 0,
          rejected: 0,
          cancelled: 0,
        }

        donationsData.forEach((donation) => {
          statusCounts[donation.status as keyof typeof statusCounts]++
        })

        data = {
          total: donationsData.length,
          statusCounts,
          startDate,
          endDate,
        }
      } else if (reportType === "users") {
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, role, created_at")
          .gte("created_at", start)
          .lte("created_at", end)

        if (usersError) throw usersError

        // Process data for report
        const roleCounts = {
          donor: 0,
          ngo: 0,
          admin: 0,
        }

        usersData.forEach((user) => {
          roleCounts[user.role as keyof typeof roleCounts]++
        })

        data = {
          total: usersData.length,
          roleCounts,
          startDate,
          endDate,
        }
      }

      // Save report to database
      const { error: saveError } = await supabase.from("reports").insert({
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        description: `Report for ${startDate} to ${endDate}`,
        report_type: reportType,
        parameters: { startDate, endDate },
        result_data: data,
        created_by: user.id,
      })

      if (saveError) throw saveError

      setReportData(data)
    } catch (err: any) {
      console.error("Error generating report:", err)
      setError(err.message || "Failed to generate report")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reports</h2>
      </div>

      <Tabs defaultValue="donations" onValueChange={setReportType}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="donations">
            <Package className="mr-2 h-4 w-4" />
            Donations
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>
        <TabsContent value="donations">
          <Card>
            <CardHeader>
              <CardTitle>Donations Report</CardTitle>
              <CardDescription>Generate a report of donations for a specific time period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={generateReport} disabled={loading}>
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users Report</CardTitle>
              <CardDescription>Generate a report of user registrations for a specific time period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={generateReport} disabled={loading}>
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>{reportType === "donations" ? "Donations Report" : "Users Report"} Results</CardTitle>
            <CardDescription>
              {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reportType === "donations" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Total Donations</h3>
                    <p className="text-3xl font-bold">{reportData.total}</p>
                  </div>
                  <PieChart className="h-8 w-8 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Status Breakdown</h3>
                  <div className="grid gap-2">
                    {Object.entries(reportData.statusCounts).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`h-3 w-3 rounded-full bg-primary mr-2`}></div>
                          <span className="capitalize">{status}</span>
                        </div>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {reportType === "users" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Total Users</h3>
                    <p className="text-3xl font-bold">{reportData.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Role Breakdown</h3>
                  <div className="grid gap-2">
                    {Object.entries(reportData.roleCounts).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`h-3 w-3 rounded-full bg-primary mr-2`}></div>
                          <span className="capitalize">{role}</span>
                        </div>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline">Download Report</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { createClientComponentClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlusCircle, Trash2 } from "lucide-react"

export default function CreateDonationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [quantityTotal, setQuantityTotal] = useState("")
  const [quantityUnit, setQuantityUnit] = useState("kg")
  const [expiryTime, setExpiryTime] = useState("")
  const [pickupLocation, setPickupLocation] = useState("")
  const [pickupNotes, setPickupNotes] = useState("")
  const [foodItems, setFoodItems] = useState([{ name: "", category: "", quantity: "", quantityUnit: "kg" }])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAddFoodItem = () => {
    setFoodItems([...foodItems, { name: "", category: "", quantity: "", quantityUnit: "kg" }])
  }

  const handleRemoveFoodItem = (index: number) => {
    const newFoodItems = [...foodItems]
    newFoodItems.splice(index, 1)
    setFoodItems(newFoodItems)
  }

  const handleFoodItemChange = (index: number, field: string, value: string) => {
    const newFoodItems = [...foodItems]
    newFoodItems[index] = { ...newFoodItems[index], [field]: value }
    setFoodItems(newFoodItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || user.role !== "donor") {
      setError("Only donors can create donations")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create the donation
      const { data: donationData, error: donationError } = await supabase
        .from("food_donations")
        .insert({
          donor_id: user.id,
          title,
          description,
          quantity_total: Number.parseFloat(quantityTotal),
          quantity_unit: quantityUnit,
          expiry_time: new Date(expiryTime).toISOString(),
          pickup_location,
          pickup_notes,
          status: "pending",
        })
        .select("id")
        .single()

      if (donationError) throw donationError

      // Create the food items
      const foodItemsToInsert = foodItems.map((item) => ({
        donation_id: donationData.id,
        name: item.name,
        category: item.category,
        quantity: Number.parseFloat(item.quantity),
        quantity_unit: item.quantityUnit,
      }))

      const { error: foodItemsError } = await supabase.from("food_items").insert(foodItemsToInsert)

      if (foodItemsError) throw foodItemsError

      router.push("/dashboard/donations")
    } catch (err: any) {
      setError(err.message || "Failed to create donation")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Donation</CardTitle>
        <CardDescription>Fill in the details about the food you want to donate</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Donation Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantityTotal">Total Quantity</Label>
                <Input
                  id="quantityTotal"
                  type="number"
                  step="0.01"
                  min="0"
                  value={quantityTotal}
                  onChange={(e) => setQuantityTotal(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantityUnit">Unit</Label>
                <select
                  id="quantityUnit"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={quantityUnit}
                  onChange={(e) => setQuantityUnit(e.target.value)}
                  required
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="l">Liters (l)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="servings">Servings</option>
                  <option value="pieces">Pieces</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryTime">Expiry Time</Label>
              <Input
                id="expiryTime"
                type="datetime-local"
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupLocation">Pickup Location</Label>
              <Input
                id="pickupLocation"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupNotes">Pickup Notes</Label>
              <Textarea
                id="pickupNotes"
                value={pickupNotes}
                onChange={(e) => setPickupNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Food Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddFoodItem}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {foodItems.map((item, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-md">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {foodItems.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveFoodItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`item-name-${index}`}>Name</Label>
                    <Input
                      id={`item-name-${index}`}
                      value={item.name}
                      onChange={(e) => handleFoodItemChange(index, "name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`item-category-${index}`}>Category</Label>
                    <select
                      id={`item-category-${index}`}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={item.category}
                      onChange={(e) => handleFoodItemChange(index, "category", e.target.value)}
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="grains">Grains & Cereals</option>
                      <option value="vegetables">Vegetables</option>
                      <option value="fruits">Fruits</option>
                      <option value="dairy">Dairy</option>
                      <option value="meat">Meat & Poultry</option>
                      <option value="seafood">Seafood</option>
                      <option value="bakery">Bakery Items</option>
                      <option value="prepared">Prepared Meals</option>
                      <option value="canned">Canned Goods</option>
                      <option value="beverages">Beverages</option>
                      <option value="snacks">Snacks</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`item-quantity-${index}`}>Quantity</Label>
                      <Input
                        id={`item-quantity-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => handleFoodItemChange(index, "quantity", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`item-unit-${index}`}>Unit</Label>
                      <select
                        id={`item-unit-${index}`}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={item.quantityUnit}
                        onChange={(e) => handleFoodItemChange(index, "quantityUnit", e.target.value)}
                        required
                      >
                        <option value="kg">Kilograms (kg)</option>
                        <option value="g">Grams (g)</option>
                        <option value="l">Liters (l)</option>
                        <option value="ml">Milliliters (ml)</option>
                        <option value="servings">Servings</option>
                        <option value="pieces">Pieces</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <CardFooter className="flex justify-end px-0">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Donation"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
